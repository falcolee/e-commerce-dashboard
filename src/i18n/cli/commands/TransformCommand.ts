import { CodeTransformer } from '../../extractor/CodeTransformer';
import { TransformResult, TranslationMap } from '../../types/TextExtraction';
import chalk from 'chalk';
import * as fs from 'fs';

export class TransformCommand {
  private codeTransformer: CodeTransformer;

  constructor() {
    this.codeTransformer = new CodeTransformer();
  }

  async execute(files: string[], translationFile: string): Promise<TransformResult> {
    const startTime = Date.now();

    console.log(chalk.blue('🔄 Transforming source files...'));

    // Load translation map
    const translationMap = await this.loadTranslationMap(translationFile);
    console.log(chalk.green(`📖 Loaded translation map with ${this.countTranslationKeys(translationMap)} keys`));

    // Transform files
    const transformResult = await this.codeTransformer.transformMultipleFiles(files, translationMap);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(chalk.green(`\n✅ Transformation completed in ${processingTime}ms`));
    console.log(chalk.green(`📁 Transformed ${transformResult.totalTransformations} files`));

    if (transformResult.errors.length > 0) {
      console.log(chalk.red(`\n❌ ${transformResult.errors.length} errors occurred:`));
      transformResult.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
    }

    // Validate transformed files
    console.log(chalk.blue('\n🔍 Validating transformed files...'));
    let validationPassed = 0;
    for (const filePath of transformResult.transformedFiles) {
      if (this.codeTransformer.validateTransformedFile(filePath)) {
        validationPassed++;
      }
    }

    console.log(chalk.green(`✅ ${validationPassed}/${transformResult.transformedFiles} files passed validation`));

    return transformResult;
  }

  async executeFromFilesList(filesListPath: string, translationFile: string): Promise<TransformResult> {
    try {
      console.log(chalk.blue(`📂 Reading files list from: ${filesListPath}`));

      if (!fs.existsSync(filesListPath)) {
        throw new Error(`Files list not found: ${filesListPath}`);
      }

      const filesList = JSON.parse(fs.readFileSync(filesListPath, 'utf8'));
      const files = filesList.files || filesList; // Handle both scan result format and simple array

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('Invalid files list: must be a non-empty array');
      }

      console.log(chalk.green(`📁 Found ${files.length} files to transform`));

      return this.execute(files, translationFile);
    } catch (error) {
      console.error(chalk.red(`❌ Error reading files list: ${error}`));
      throw error;
    }
  }

  private async loadTranslationMap(translationFile: string): Promise<TranslationMap> {
    try {
      if (!fs.existsSync(translationFile)) {
        throw new Error(`Translation file not found: ${translationFile}`);
      }

      const content = fs.readFileSync(translationFile, 'utf8');
      const translationMap = JSON.parse(content);

      if (typeof translationMap !== 'object' || translationMap === null) {
        throw new Error('Invalid translation file: must be a JSON object');
      }

      return translationMap;
    } catch (error) {
      console.error(chalk.red(`❌ Error loading translation map: ${error}`));
      throw error;
    }
  }

  private countTranslationKeys(translationMap: TranslationMap): number {
    let count = 0;
    for (const namespace of Object.keys(translationMap)) {
      count += Object.keys(translationMap[namespace]).length;
    }
    return count;
  }

  async dryRun(files: string[], translationFile: string): Promise<void> {
    console.log(chalk.blue('🔍 Dry run: checking transformations without modifying files...'));

    const translationMap = await this.loadTranslationMap(translationFile);
    console.log(chalk.green(`📖 Loaded translation map with ${this.countTranslationKeys(translationMap)} keys`));

    let totalTransformations = 0;
    const fileTransformations = new Map<string, number>();

    for (const filePath of files) {
      try {
        const transformationCount = await this.analyzeTransformations(filePath, translationMap);
        fileTransformations.set(filePath, transformationCount);
        totalTransformations += transformationCount;
        console.log(chalk.white(`  ${filePath}: ${transformationCount} potential transformations`));
      } catch (error) {
        console.error(chalk.red(`  ✗ Error analyzing ${filePath}: ${error}`));
      }
    }

    console.log(chalk.green(`\n📊 Dry run summary:`));
    console.log(chalk.white(`  Total files analyzed: ${files.length}`));
    console.log(chalk.white(`  Total potential transformations: ${totalTransformations}`));
    console.log(chalk.white(`  Average transformations per file: ${(totalTransformations / files.length).toFixed(1)}`));
  }

  private async analyzeTransformations(filePath: string, translationMap: TranslationMap): Promise<number> {
    // This is a simplified version that would need to be implemented
    // to actually analyze without transforming
    // For now, we'll estimate based on file content
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Simple heuristic: count lines that might contain translatable text
      let potentialTransformations = 0;
      for (const line of lines) {
        if (this.lineContainsTranslatableText(line)) {
          potentialTransformations++;
        }
      }

      return Math.floor(potentialTransformations / 2); // Rough estimate
    } catch {
      return 0;
    }
  }

  private lineContainsTranslatableText(line: string): boolean {
    // Look for patterns that might contain translatable text
    const patterns = [
      /"[^"]+"/g,  // String literals
      /'[^']+'/g,  // String literals
      />[^<]+</g,  // JSX text content
      /title[^=]*=/g,  // Title attributes
      /placeholder[^=]*=/g,  // Placeholder attributes
    ];

    let matchCount = 0;
    for (const pattern of patterns) {
      const matches = line.match(pattern);
      if (matches) {
        matchCount += matches.length;
      }
    }

    return matchCount > 0;
  }

  async saveTransformResults(transformResult: TransformResult, outputPath: string): Promise<void> {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(transformResult, null, 2));
      console.log(chalk.blue(`💾 Transform results saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error saving transform results: ${error}`));
      throw error;
    }
  }

  generateTransformReport(transformResult: TransformResult): void {
    console.log(chalk.blue('\n📋 Transformation Report:'));
    console.log(chalk.white(`  Total files processed: ${transformResult.transformedFiles.length}`));
    console.log(chalk.white(`  Successful transformations: ${transformResult.totalTransformations}`));
    console.log(chalk.white(`  Errors encountered: ${transformResult.errors.length}`));

    if (transformResult.transformedFiles.length > 0) {
      console.log(chalk.white('\n  Transformed files:'));
      transformResult.transformedFiles.forEach(file => {
        console.log(chalk.green(`    ✓ ${file}`));
      });
    }

    if (transformResult.errors.length > 0) {
      console.log(chalk.white('\n  Errors:'));
      transformResult.errors.forEach(error => {
        console.log(chalk.red(`    ✗ ${error}`));
      });
    }
  }
}