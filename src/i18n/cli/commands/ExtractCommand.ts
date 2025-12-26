import { TextExtractor } from '../../extractor/TextExtractor';
import { FileGenerator } from '../../extractor/FileGenerator';
import { ExtractResult, ExtractedText } from '../../types/TextExtraction';
import chalk from 'chalk';
import * as fs from 'fs';

export class ExtractCommand {
  private textExtractor: TextExtractor;
  private fileGenerator: FileGenerator;

  constructor(keyFormat: 'camelCase' | 'snake_case' | 'kebab-case' = 'camelCase') {
    this.textExtractor = new TextExtractor();
    this.fileGenerator = new FileGenerator(keyFormat);
  }

  async execute(files: string[], outputPath: string): Promise<ExtractResult> {
    const startTime = Date.now();

    console.log(chalk.blue('📝 Extracting text from files...'));

    const extractedTexts: ExtractedText[] = [];

    // Extract text from each file
    for (const filePath of files) {
      try {
        console.log(chalk.white(`  Processing: ${filePath}`));
        const texts = this.textExtractor.extractStaticText(filePath);
        extractedTexts.push(...texts);
        console.log(chalk.green(`    ✓ Found ${texts.length} texts`));
      } catch (error) {
        console.error(chalk.red(`    ✗ Error extracting from ${filePath}: ${error}`));
      }
    }

    // Remove duplicates by text content
    const uniqueTexts = this.deduplicateTexts(extractedTexts);

    // Generate translation file
    console.log(chalk.blue('\n📄 Generating translation file...'));
    this.fileGenerator.generateTranslationFileWithMerge(uniqueTexts, outputPath);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Generate statistics
    const uniqueNamespaces = [...new Set(uniqueTexts.map(text => text.namespace))];

    const extractResult: ExtractResult = {
      extractedTexts: uniqueTexts,
      translationMap: this.fileGenerator.createTranslationMap(uniqueTexts),
      totalTexts: uniqueTexts.length,
      uniqueNamespaces
    };

    console.log(chalk.green(`\n✅ Extraction completed in ${processingTime}ms`));
    console.log(chalk.green(`📊 Extracted ${uniqueTexts.length} unique texts from ${files.length} files`));
    console.log(chalk.green(`🏷️  Namespaces: ${uniqueNamespaces.join(', ')}`));

    return extractResult;
  }

  async executeFromScanResults(scanResultsPath: string, outputPath: string): Promise<ExtractResult> {
    try {
      console.log(chalk.blue(`📂 Reading scan results from: ${scanResultsPath}`));

      if (!fs.existsSync(scanResultsPath)) {
        throw new Error(`Scan results file not found: ${scanResultsPath}`);
      }

      const scanResults = JSON.parse(fs.readFileSync(scanResultsPath, 'utf8'));
      const files = scanResults.files || [];

      if (files.length === 0) {
        console.warn(chalk.yellow('⚠️  No files found in scan results'));
        return {
          extractedTexts: [],
          translationMap: {},
          totalTexts: 0,
          uniqueNamespaces: []
        };
      }

      console.log(chalk.green(`📁 Found ${files.length} files in scan results`));

      return this.execute(files, outputPath);
    } catch (error) {
      console.error(chalk.red(`❌ Error reading scan results: ${error}`));
      throw error;
    }
  }

  private deduplicateTexts(texts: ExtractedText[]): ExtractedText[] {
    const seen = new Map<string, ExtractedText>();

    texts.forEach(text => {
      const key = `${text.namespace}:${text.text}`;
      if (!seen.has(key)) {
        seen.set(key, text);
      }
    });

    return Array.from(seen.values());
  }

  async saveExtractResults(extractResult: ExtractResult, outputPath: string): Promise<void> {
    try {
      // Save detailed extraction results
      const detailedOutput = outputPath.replace('.json', '_details.json');
      fs.writeFileSync(detailedOutput, JSON.stringify(extractResult, null, 2));
      console.log(chalk.blue(`💾 Detailed extraction results saved to: ${detailedOutput}`));

      // Save just the translation map for easy consumption
      const translationOutput = outputPath;
      fs.writeFileSync(translationOutput, JSON.stringify(extractResult.translationMap, null, 2));
      console.log(chalk.blue(`💾 Translation map saved to: ${translationOutput}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error saving extract results: ${error}`));
      throw error;
    }
  }

  generateExtractionReport(extractResult: ExtractResult): void {
    console.log(chalk.blue('\n📋 Extraction Report:'));
    console.log(chalk.white(`  Total texts extracted: ${extractResult.totalTexts}`));
    console.log(chalk.white(`  Unique namespaces: ${extractResult.uniqueNamespaces.length}`));

    extractResult.uniqueNamespaces.forEach(namespace => {
      const namespaceTexts = extractResult.extractedTexts.filter(text => text.namespace === namespace);
      console.log(chalk.white(`    ${namespace}: ${namespaceTexts.length} texts`));
    });

    // Show breakdown by type
    const typeBreakdown = new Map<string, number>();
    extractResult.extractedTexts.forEach(text => {
      const count = typeBreakdown.get(text.type) || 0;
      typeBreakdown.set(text.type, count + 1);
    });

    console.log(chalk.white('\n  Text types:'));
    typeBreakdown.forEach((count, type) => {
      console.log(chalk.white(`    ${type}: ${count}`));
    });

    // Show sample texts for each namespace
    console.log(chalk.white('\n  Sample texts:'));
    extractResult.uniqueNamespaces.forEach(namespace => {
      const namespaceTexts = extractResult.extractedTexts.filter(text => text.namespace === namespace);
      const samples = namespaceTexts.slice(0, 3);
      console.log(chalk.white(`    ${namespace}:`));
      samples.forEach(text => {
        console.log(chalk.gray(`      "${text.text}"`));
      });
      if (namespaceTexts.length > 3) {
        console.log(chalk.gray(`      ... and ${namespaceTexts.length - 3} more`));
      }
    });
  }
}