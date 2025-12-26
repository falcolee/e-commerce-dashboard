import { Project, SourceFile, Node, JsxElement, CallExpression, PropertyAssignment, StringLiteral } from 'ts-morph';
import { ExtractedText } from '../types/TextExtraction';
import { isStaticTextNode, extractTextFromJsxElement, extractTextFromCallExpression, extractTextFromProperties, detectNamespaceFromPath, generateLineColumnInfo } from '../utils/astHelpers';

export class TextExtractor {
  private project: Project;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
  }

  extractStaticText(filePath: string): ExtractedText[] {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    const extractedTexts: ExtractedText[] = [];
    const namespace = detectNamespaceFromPath(filePath);

    // Traverse the AST
    sourceFile.forEachDescendant(node => {
      const texts = this.extractFromNode(node, namespace);
      extractedTexts.push(...texts);
    });

    return this.deduplicateTexts(extractedTexts);
  }

  private extractFromNode(node: Node, namespace: string): ExtractedText[] {
    const extractedTexts: ExtractedText[] = [];
    const lineColumnInfo = generateLineColumnInfo(node);

    switch (node.getKindName()) {
      case 'StringLiteral': {
        if (!Node.isStringLiteral(node)) break;
        const stringLiteral: StringLiteral = node;
        const stringText = stringLiteral.getLiteralValue();

        // Skip string literals in import statements
        if (this.isInImportStatement(node)) {
          break;
        }

        if (this.isValidStaticText(stringText)) {
          extractedTexts.push({
            id: this.generateId(node, stringText),
            text: stringText,
            filePath: node.getSourceFile().getFilePath(),
            lineNumber: lineColumnInfo.line,
            columnNumber: lineColumnInfo.column,
            context: this.getContext(node),
            namespace,
            type: this.getTypeFromContext(node)
          });
        }
        break;
      }

      case 'JsxElement': {
        const jsxElement = node as JsxElement;
        const jsxTexts = extractTextFromJsxElement(jsxElement);
        jsxTexts.forEach(text => {
          if (this.isValidStaticText(text)) {
            extractedTexts.push({
              id: this.generateId(node, text),
              text,
              filePath: node.getSourceFile().getFilePath(),
              lineNumber: lineColumnInfo.line,
              columnNumber: lineColumnInfo.column,
              context: 'jsx_element',
              namespace,
              type: 'jsx'
            });
          }
        });
        break;
      }

      case 'CallExpression': {
        const callExpression = node as CallExpression;
        const callTexts = extractTextFromCallExpression(callExpression);
        callTexts.forEach(text => {
          if (this.isValidStaticText(text)) {
            extractedTexts.push({
              id: this.generateId(node, text),
              text,
              filePath: node.getSourceFile().getFilePath(),
              lineNumber: lineColumnInfo.line,
              columnNumber: lineColumnInfo.column,
              context: 'call_expression',
              namespace,
              type: 'message'
            });
          }
        });
        break;
      }
    }

    return extractedTexts;
  }

  extractFromJsxElement(element: JsxElement): string[] {
    return extractTextFromJsxElement(element);
  }

  extractFromCallExpression(expression: CallExpression): string[] {
    return extractTextFromCallExpression(expression);
  }

  extractFromProperties(properties: PropertyAssignment[]): string[] {
    return extractTextFromProperties(properties);
  }

  private isValidStaticText(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    // Skip empty strings or whitespace only
    if (text.trim().length === 0) return false;

    // Skip strings that look like variables or expressions
    if (text.startsWith('${') || text.includes('{$') || text.match(/^\s*\{\s*\w/)) return false;

    // Skip actual JSX attribute text (e.g., className="value")
    const trimmed = text.trim();
    const attributeNameOnly = ['class', 'className', 'id'];
    if (attributeNameOnly.includes(trimmed)) return false;

    const attributePattern = /^(class(Name)?|id|data-[\w-]+)\s*=/;
    if (attributePattern.test(trimmed)) return false;

    // Skip very short strings (likely not user-facing)
    if (text.trim().length < 2) return false;

    // Skip technical strings
    const technicalPatterns = [
      /^[a-z]+[A-Z][a-zA-Z]*$/, // camelCase variables
      /^[a-z]+_[a-z_]+$/, // snake_case variables
      /^[a-f0-9-]{36}$/, // UUIDs
      /^#[0-9a-fA-F]{6}$/, // Hex colors
      /^\d+px$/, // Pixel values
      /^http[s]?:\/\//, // URLs
    ];

    return !technicalPatterns.some(pattern => pattern.test(text));
  }

  private getContext(node: Node): string {
    const parent = node.getParent();
    if (!parent) return 'root';

    const parentKind = parent.getKindName();
    const parentText = parent.getText().substring(0, 50);

    switch (parentKind) {
      case 'JsxSelfClosingElement':
        return `jsx_self_closing_${parentText}`;
      case 'JsxOpeningElement':
        return `jsx_opening_${parentText}`;
      case 'CallExpression':
        return `call_expression_${parentText}`;
      case 'PropertyAssignment': {
        const propAssignment = parent as PropertyAssignment;
        const propName = propAssignment.getName();
        return `property_${propName}`;
      }
      default:
        return parentKind.toLowerCase();
    }
  }

  private getTypeFromContext(node: Node): ExtractedText['type'] {
    const context = this.getContext(node);

    if (context.includes('jsx')) return 'jsx';
    if (context.includes('call')) return 'message';
    if (context.includes('property')) {
      const parent = node.getParent();
      if (parent && Node.isPropertyAssignment(parent)) {
        const propName = parent.getName();
        if (['title', 'content', 'message'].includes(propName)) return 'modal';
        if (['placeholder', 'label'].includes(propName)) return 'form';
        if (['title', 'dataIndex'].includes(propName)) return 'table';
      }
    }

    return 'prop';
  }

  private generateId(node: Node, text: string): string {
    const filePath = node.getSourceFile().getFilePath();
    const lineColumnInfo = generateLineColumnInfo(node);
    const textHash = this.hashString(text);
    return `${filePath}_${lineColumnInfo.line}_${lineColumnInfo.column}_${textHash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isInImportStatement(node: Node): boolean {
    let parent = node.getParent();
    while (parent) {
      if (parent.getKindName() === 'ImportDeclaration') {
        return true;
      }
      parent = parent.getParent();
    }
    return false;
  }

  private deduplicateTexts(texts: ExtractedText[]): ExtractedText[] {
    const seen = new Set<string>();
    return texts.filter(text => {
      const key = `${text.text}_${text.namespace}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
