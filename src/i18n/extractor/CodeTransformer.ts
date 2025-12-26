import {
  Project,
  SourceFile,
  Node,
  StringLiteral,
  JsxText,
  JsxAttribute,
  ArrowFunction,
  FunctionDeclaration,
  SyntaxKind
} from 'ts-morph';
import { TranslationMap, TransformResult } from '../types/TextExtraction';
import { detectNamespaceFromPath } from '../utils/astHelpers';
import * as fs from 'fs/promises';
import * as syncFs from 'fs';
import * as path from 'path';

type TranslationLookupEntry = {
  namespace: string;
  key: string;
};

type TranslationLookup = Map<string, TranslationLookupEntry[]>;

export class CodeTransformer {
  private project: Project;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
  }

  async transformFile(filePath: string, translations: TranslationMap): Promise<boolean> {
    let backupPath: string | null = null;
    let transformed = false;

    try {
      // Validate file exists and is accessible
      await this.validateFile(filePath);

      // Create backup
      backupPath = await this.createBackup(filePath);

      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const namespace = detectNamespaceFromPath(filePath);
      const translationLookup = this.buildTranslationLookup(translations);

      // Transform static text
      let replacedText = false;
      sourceFile.forEachDescendant(node => {
        if (this.shouldTransformNode(node, translationLookup)) {
          const text = this.extractTextFromNode(node);
          if (text) {
            const key = this.findTranslationKey(text, namespace, translationLookup);
            if (key) {
              this.replaceStaticText(node, key);
              replacedText = true;
            }
          }
        }
      });

      // Add useTranslation hook if needed
      if (replacedText) {
        const importUpdated = await this.ensureUseTranslationImport(sourceFile);
        const hookAdded = await this.addUseTranslationHook(sourceFile, namespace);
        transformed = importUpdated || hookAdded || replacedText;
      }

      if (!replacedText) {
        console.log(`ℹ️  No translatable text found in ${filePath}`);
      }

      // Validate the transformed code
      await this.validateTransformedCode(sourceFile);

      // Save the transformed file
      if (transformed) {
        await sourceFile.save();
        console.log(`✅ Transformed: ${filePath}`);
      } else {
        // Remove file from project cache to avoid stale data
        this.project.removeSourceFile(sourceFile);
      }

    } catch (error) {
      console.error(`❌ Error transforming file ${filePath}: ${error}`);

      // Attempt to restore from backup if transformation failed
      if (backupPath) {
        try {
          await this.restoreFromBackup(filePath, backupPath);
          console.log(`🔄 Restored ${filePath} from backup due to transformation error`);
        } catch (restoreError) {
          console.error(`❌ Failed to restore backup: ${restoreError}`);
        }
      }

      throw error;
    } finally {
      if (!transformed && backupPath) {
        try {
          await fs.unlink(backupPath);
        } catch (cleanupError) {
          console.warn(`⚠️  Failed to remove backup ${backupPath}: ${cleanupError}`);
        }
      }
    }

    return transformed;
  }

  private async validateFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
      }
    } catch (error) {
      throw new Error(`File validation failed for ${filePath}: ${error}`);
    }
  }

  private shouldTransformNode(node: Node, translationLookup: TranslationLookup): boolean {
    if (node.getKindName() === 'StringLiteral') {
      const text = (node as StringLiteral).getLiteralValue();
      return this.isTranslatableText(text, translationLookup);
    }

    if (node.getKindName() === 'JsxText') {
      const text = node.getText().trim();
      return this.isTranslatableText(text, translationLookup);
    }

    return false;
  }

  private extractTextFromNode(node: Node): string | null {
    if (node.getKindName() === 'StringLiteral') {
      return (node as StringLiteral).getLiteralValue();
    }

    if (node.getKindName() === 'JsxText') {
      const text = node.getText().trim();
      return text.length > 0 ? text : null;
    }

    return null;
  }

  private isTranslatableText(text: string, translationLookup: TranslationLookup): boolean {
    if (!text || typeof text !== 'string') return false;

    // Skip technical strings and patterns
    const skipPatterns = [
      /^[a-z]+[A-Z][a-zA-Z]*$/, // camelCase variables
      /^[a-z]+_[a-z_]+$/, // snake_case variables
      /^#[0-9a-fA-F]{6}$/, // Hex colors
      /^\d+px$/, // Pixel values
      /^http[s]?:\/\//, // URLs
      /^\s*\{\s*\w/, // Template literals
      /\$\{.*?\}/, // Template expressions
      /className/,
      /class=/,
      /id=/,
      /style=/,
      /onClick/,
      /onChange/,
      /on[A-Z]/,
      /^react$/, // React module import
      /^react-dom$/, // React DOM module import
      /^[a-z-]+\/[a-z-]+$/ // Package names like ant-design/icons
    ];

    if (skipPatterns.some(pattern => pattern.test(text))) {
      return false;
    }

    // Skip very short strings (likely not user-facing)
    if (text.trim().length < 2) return false;

    return translationLookup.has(text);
  }

  private findTranslationKey(text: string, namespace: string, translationLookup: TranslationLookup): string | null {
    const matches = translationLookup.get(text);
    if (!matches || matches.length === 0) {
      return null;
    }

    const sameNamespace = matches.find(entry => entry.namespace === namespace);
    const entry = sameNamespace || matches[0];
    return entry.namespace === namespace ? entry.key : `${entry.namespace}:${entry.key}`;
  }

  private replaceStaticText(node: Node, key: string): void {
    const parent = node.getParent();

    if (node.getKindName() === 'StringLiteral') {
      // Check if this string literal is a JSX attribute value
      if (parent && parent.getKindName() === 'JsxAttribute') {
        // For JSX attributes, we need to wrap in curly braces
        const newCallExpression = `{t('${key}')}`;
        node.replaceWithText(newCallExpression);
      } else {
        // For regular string literals
        const newCallExpression = `t('${key}')`;
        node.replaceWithText(newCallExpression);
      }
    } else if (node.getKindName() === 'JsxText') {
      // Replace JSX text with expression
      const newExpression = `{t('${key}')}`;
      node.replaceWithText(newExpression);
    }
  }

  private async insertImportStatement(sourceFile: SourceFile): Promise<void> {
    try {
      // Get existing imports to determine proper placement
      const existingImports = sourceFile.getImportDeclarations();

      // Find the best position for the new import
      let insertIndex = 0;

      // Try to place with other react-related imports
      for (let i = 0; i < existingImports.length; i++) {
        const importDecl = existingImports[i];
        const moduleSpecifier = importDecl.getModuleSpecifier().getLiteralValue();

        if (moduleSpecifier.startsWith('react') ||
            moduleSpecifier.includes('i18n') ||
            moduleSpecifier.startsWith('@')) {
          insertIndex = i + 1;
          break;
        }
      }

      // Add import statement
      const importDeclaration = sourceFile.insertImportDeclaration(insertIndex, {
        moduleSpecifier: 'react-i18next',
        namedImports: ['useTranslation']
      });

      console.log(`✅ Added import statement to ${sourceFile.getFilePath()}`);
    } catch (error) {
      throw new Error(`Failed to insert import statement: ${error}`);
    }
  }

  private findTargetFunction(sourceFile: SourceFile): FunctionDeclaration | ArrowFunction | undefined {
    const functions = sourceFile.getFunctions();
    if (functions.length > 0) {
      return functions[0];
    }

    const arrowFunctions = sourceFile.getVariableDeclarations()
      .map(declaration => declaration.getInitializer())
      .filter((initializer): initializer is ArrowFunction => initializer?.getKindName() === 'ArrowFunction');

    if (arrowFunctions.length > 0) {
      return arrowFunctions[0];
    }

    const exportedFunction = sourceFile.getFunctions().find(f => f.isExported() || f.isDefaultExport());
    if (exportedFunction) {
      return exportedFunction;
    }

    const exportedArrowFunction = sourceFile.getVariableDeclarations().find(v =>
      (v.isExported() || v.isDefaultExport()) &&
      v.getInitializer()?.getKindName() === 'ArrowFunction'
    );

    return exportedArrowFunction?.getInitializer() as ArrowFunction | undefined;
  }

  private hasExistingUseTranslation(targetFunction: FunctionDeclaration | ArrowFunction): boolean {
    const variableDeclarations = targetFunction.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

    return variableDeclarations.some(declaration => {
      const initializer = declaration.getInitializer();
      if (!initializer || !Node.isCallExpression(initializer)) {
        return false;
      }

      const expression = initializer.getExpression();
      if (expression.getText() !== 'useTranslation') {
        return false;
      }

      const nameNode = declaration.getNameNode();
      if (Node.isObjectBindingPattern(nameNode)) {
        return nameNode.getElements().some(element => element.getNameNode().getText() === 't');
      }

      return true;
    });
  }

  private async addUseTranslationHook(sourceFile: SourceFile, namespace: string): Promise<boolean> {
    try {
      const targetFunction = this.findTargetFunction(sourceFile);

      if (!targetFunction) {
        console.warn(`⚠️  Could not find component function in ${sourceFile.getFilePath()}`);
        return false;
      }

      if (this.hasExistingUseTranslation(targetFunction)) {
        return false;
      }

      const hookStatement = `const { t } = useTranslation('${namespace}');`;
      const statements = targetFunction.getStatements();

      if (statements.length === 0) {
        // Add to empty function
        targetFunction.addStatements([hookStatement]);
      } else {
        // Find the best position for the hook
        let insertIndex = 0;

        // Look for existing hooks to insert after them
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          const text = statement.getText();

          if (text.includes('useState') ||
              text.includes('useEffect') ||
              text.includes('useContext') ||
              (text.includes('const ') && text.includes('use'))) {
            insertIndex = i + 1;
          } else if (text.includes('return') || text.includes('export')) {
            // Don't go past return or export statements
            break;
          }
        }

        targetFunction.insertStatements(insertIndex, [hookStatement]);
      }

      console.log(`✅ Added useTranslation hook to ${sourceFile.getFilePath()}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to add useTranslation hook: ${error}`);
    }
  }

  private async createBackup(filePath: string): Promise<string> {
    const timestamp = Date.now();
    const backupPath = `${filePath}.backup.${timestamp}`;

    try {
      await fs.copyFile(filePath, backupPath);
      console.log(`💾 Created backup: ${backupPath}`);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup for ${filePath}: ${error}`);
    }
  }

  private async restoreFromBackup(filePath: string, backupPath: string): Promise<void> {
    try {
      await fs.copyFile(backupPath, filePath);
      console.log(`🔄 Restored ${filePath} from backup`);
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error}`);
    }
  }

  private async validateTransformedCode(sourceFile: SourceFile): Promise<void> {
    try {
      // Try to get the full text to ensure the file is syntactically valid
      const fullText = sourceFile.getFullText();

      // Basic checks for common issues
      if (fullText.includes('t(\'\'') || fullText.includes('t("")')) {
        throw new Error('Empty translation keys found');
      }

      // Check for unmatched quotes in t() calls
      const tCallMatches = fullText.match(/t\(['"][^'"]*['"]\)/g);
      if (tCallMatches) {
        for (const match of tCallMatches) {
          if ((match.match(/'/g) || []).length % 2 !== 0 ||
              (match.match(/"/g) || []).length % 2 !== 0) {
            throw new Error(`Unmatched quotes in translation call: ${match}`);
          }
        }
      }

      console.log(`✅ Code validation passed for ${sourceFile.getFilePath()}`);
    } catch (error) {
      throw new Error(`Code validation failed: ${error}`);
    }
  }

  async transformMultipleFiles(filePaths: string[], translations: TranslationMap): Promise<TransformResult> {
    const transformedFiles: string[] = [];
    const errors: string[] = [];

    console.log(`🔄 Starting transformation of ${filePaths.length} files...`);

    // Process files in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (filePath) => {
          try {
            const transformed = await this.transformFile(filePath, translations);
            if (transformed) {
              transformedFiles.push(filePath);
            }
          } catch (error) {
            const errorMessage = `Failed to transform ${filePath}: ${error}`;
            errors.push(errorMessage);
            console.error(errorMessage);
          }
        })
      );

      // Small delay between batches to prevent overwhelming the file system
      if (i + batchSize < filePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Transformation completed: ${transformedFiles.length}/${filePaths.length} files processed successfully`);

    return {
      transformedFiles,
      totalTransformations: transformedFiles.length,
      errors
    };
  }

  validateTransformedFile(filePath: string): boolean {
    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);

      // Check if file has useTranslation import
      const hasImport = sourceFile.getImportDeclarations().some(
        decl => decl.getModuleSpecifier().getLiteralValue() === 'react-i18next'
      );

      if (!hasImport) {
        console.warn(`⚠️  File ${filePath} missing react-i18next import`);
        return false;
      }

      // Check if file has useTranslation hook
      const hasHook = sourceFile.getFullText().includes('useTranslation');

      if (!hasHook) {
        console.warn(`⚠️  File ${filePath} missing useTranslation hook`);
        return false;
      }

      // Check if file has t() function calls
      const hasTCalls = sourceFile.getFullText().includes('t(\'');

      if (!hasTCalls) {
        console.warn(`⚠️  File ${filePath} has no t() function calls`);
        return false;
      }

      console.log(`✅ File validation passed: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error validating transformed file ${filePath}: ${error}`);
      return false;
    }
  }

  private buildTranslationLookup(translations: TranslationMap): TranslationLookup {
    const lookup: TranslationLookup = new Map();

    Object.entries(translations).forEach(([namespace, namespaceTranslations]) => {
      Object.entries(namespaceTranslations).forEach(([key, value]) => {
        if (!lookup.has(value)) {
          lookup.set(value, []);
        }
        lookup.get(value)!.push({ namespace, key });
      });
    });

    return lookup;
  }

  private needsUseTranslationImport(sourceFile: SourceFile): boolean {
    const importDeclaration = sourceFile.getImportDeclaration(
      decl => decl.getModuleSpecifier().getLiteralValue() === 'react-i18next'
    );

    if (!importDeclaration) {
      return true;
    }

    return !importDeclaration.getNamedImports().some(namedImport => namedImport.getName() === 'useTranslation');
  }

  private async ensureUseTranslationImport(sourceFile: SourceFile): Promise<boolean> {
    if (!this.needsUseTranslationImport(sourceFile)) {
      return false;
    }

    const importDeclaration = sourceFile.getImportDeclaration(
      decl => decl.getModuleSpecifier().getLiteralValue() === 'react-i18next'
    );

    if (!importDeclaration) {
      await this.insertImportStatement(sourceFile);
      return true;
    }

    importDeclaration.addNamedImport('useTranslation');
    console.log(`✅ Added useTranslation named import to ${sourceFile.getFilePath()}`);
    return true;
  }
}
