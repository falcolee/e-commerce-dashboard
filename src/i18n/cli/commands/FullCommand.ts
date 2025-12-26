import { ScanCommand } from './ScanCommand';
import { ExtractCommand } from './ExtractCommand';
import { TransformCommand } from './TransformCommand';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { ExtractedText } from '../../types/TextExtraction';

export class FullCommand {
  private scanCommand: ScanCommand;
  private extractCommand: ExtractCommand;
  private transformCommand: TransformCommand;

  constructor(keyFormat: 'camelCase' | 'snake_case' | 'kebab-case' = 'camelCase') {
    this.scanCommand = new ScanCommand();
    this.extractCommand = new ExtractCommand(keyFormat);
    this.transformCommand = new TransformCommand();
  }

  async execute(targetPaths: string[]): Promise<void> {
    const startTime = Date.now();

    console.log(chalk.blue('🚀 Starting full i18n automation workflow...\n'));

    try {
      // Phase 1: Scan for files
      console.log(chalk.yellow('Phase 1: Scanning for target files'));
      const scanResult = await this.scanCommand.execute(targetPaths);
      const files = scanResult.files;

      if (files.length === 0) {
        console.warn(chalk.yellow('⚠️  No target files found. Aborting workflow.'));
        return;
      }

      // Save scan results for debugging
      const scanResultsPath = 'temp_scan_results.json';
      await this.scanCommand.saveScanResults(scanResult, scanResultsPath);

      // Phase 2: Extract text
      console.log(chalk.yellow('\nPhase 2: Extracting static text'));
      const translationFile = 'src/locales/en/common.json';
      const extractResult = await this.extractCommand.execute(files, translationFile);

      if (extractResult.totalTexts === 0) {
        console.warn(chalk.yellow('⚠️  No static text found. Aborting transformation.'));
        return;
      }

      // Save extract results for debugging
      const extractResultsPath = 'temp_extract_results.json';
      await this.extractCommand.saveExtractResults(extractResult, extractResultsPath);
      this.extractCommand.generateExtractionReport(extractResult);

      // Phase 3: Transform code
      console.log(chalk.yellow('\nPhase 3: Transforming source code'));
      const transformResult = await this.transformCommand.execute(files, translationFile);

      // Save transform results for debugging
      const transformResultsPath = 'temp_transform_results.json';
      await this.transformCommand.saveTransformResults(transformResult, transformResultsPath);
      this.transformCommand.generateTransformReport(transformResult);

      // Cleanup temporary files
      await this.cleanupTempFiles([scanResultsPath, extractResultsPath, transformResultsPath]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Final summary
      console.log(chalk.green('\n🎉 Full i18n automation workflow completed successfully!'));
      console.log(chalk.white(`⏱️  Total time: ${totalTime}ms`));
      console.log(chalk.white(`📁 Files processed: ${files.length}`));
      console.log(chalk.white(`📝 Texts extracted: ${extractResult.totalTexts}`));
      console.log(chalk.white(`🔄 Files transformed: ${transformResult.totalTransformations}`));
      console.log(chalk.white(`📄 Translation file: ${translationFile}`));

      this.displayNextSteps();

    } catch (error) {
      console.error(chalk.red(`\n❌ Workflow failed: ${error}`));
      throw error;
    }
  }

  async dryRun(targetPaths: string[]): Promise<void> {
    console.log(chalk.blue('🔍 Running dry run of full i18n automation workflow...\n'));

    try {
      // Phase 1: Scan for files
      console.log(chalk.yellow('Phase 1: Scanning for target files'));
      const scanResult = await this.scanCommand.execute(targetPaths);
      const files = scanResult.files;

      if (files.length === 0) {
        console.warn(chalk.yellow('⚠️  No target files found.'));
        return;
      }

      // Phase 2: Extract text (dry run)
      console.log(chalk.yellow('\nPhase 2: Analyzing text extraction'));
      const translationFile = 'src/locales/en/common.json';
      const extractResult = await this.extractCommand.execute(files, translationFile + '.dryrun');

      // Phase 3: Analyze transformations (dry run)
      console.log(chalk.yellow('\nPhase 3: Analyzing code transformations'));
      await this.transformCommand.dryRun(files, translationFile + '.dryrun');

      // Cleanup dry run files
      await this.cleanupTempFiles([translationFile + '.dryrun']);

      console.log(chalk.green('\n✅ Dry run completed successfully!'));
      console.log(chalk.white('Run the full command without --dry-run to apply the transformations.'));

    } catch (error) {
      console.error(chalk.red(`\n❌ Dry run failed: ${error}`));
      throw error;
    }
  }

  private async cleanupTempFiles(filePaths: string[]): Promise<void> {
    try {
      for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Warning: Could not clean up temporary files: ${error}`));
    }
  }

  private displayNextSteps(): void {
    console.log(chalk.blue('\n📋 Next Steps:'));
    console.log(chalk.white('1. Review the generated translation file at src/locales/en/common.json'));
    console.log(chalk.white('2. Test your application to ensure all text is displayed correctly'));
    console.log(chalk.white('3. Add more translations for other languages as needed'));
    console.log(chalk.white('4. Run your test suite to ensure no functionality is broken'));
    console.log(chalk.white('5. Commit the changes to version control'));

    console.log(chalk.blue('\n🔧 Useful commands:'));
    console.log(chalk.white('  npm run build              # Build the application'));
    console.log(chalk.white('  npm run test               # Run tests'));
    console.log(chalk.white('  npm run dev                # Start development server'));

    console.log(chalk.blue('\n📚 Documentation:'));
    console.log(chalk.white('  - react-i18next: https://react.i18next.com/'));
    console.log(chalk.white('  - i18next: https://www.i18next.com/'));
  }

  async generateReport(targetPaths: string[]): Promise<void> {
    console.log(chalk.blue('📊 Generating i18n analysis report...\n'));

    try {
      const scanResult = await this.scanCommand.execute(targetPaths);
      const files = scanResult.files;
      const translationFile = 'src/locales/en/common.json';
      const extractResult = await this.extractCommand.execute(files, translationFile + '.report');

      const report = {
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: files.length,
          totalTexts: extractResult.totalTexts,
          uniqueNamespaces: extractResult.uniqueNamespaces.length,
          estimatedTransformations: files.length // Rough estimate
        },
        files: files,
        namespaces: extractResult.uniqueNamespaces,
        textTypes: this.analyzeTextTypes(extractResult.extractedTexts),
        complexity: this.analyzeComplexity(extractResult.extractedTexts)
      };

      const reportPath = 'i18n-analysis-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      console.log(chalk.green(`✅ Analysis report saved to: ${reportPath}`));
      console.log(chalk.white(`📁 Files analyzed: ${report.summary.totalFiles}`));
      console.log(chalk.white(`📝 Texts found: ${report.summary.totalTexts}`));
      console.log(chalk.white(`🏷️  Namespaces: ${report.summary.uniqueNamespaces.join(', ')}`));

      await this.cleanupTempFiles([translationFile + '.report']);

    } catch (error) {
      console.error(chalk.red(`❌ Report generation failed: ${error}`));
      throw error;
    }
  }

  private analyzeTextTypes(extractedTexts: ExtractedText[]): { [type: string]: number } {
    const typeCounts: { [type: string]: number } = {};
    extractedTexts.forEach(text => {
      typeCounts[text.type] = (typeCounts[text.type] || 0) + 1;
    });
    return typeCounts;
  }

  private analyzeComplexity(extractedTexts: ExtractedText[]): { level: string; factors: string[] } {
    const totalTexts = extractedTexts.length;
    const uniqueNamespaces = new Set(extractedTexts.map(t => t.namespace)).size;

    if (totalTexts === 0) {
      return { level: 'None', factors: [] };
    }

    const factors: string[] = [];

    if (totalTexts > 100) factors.push('High volume of text');
    if (uniqueNamespaces > 5) factors.push('Many namespaces');
    if (extractedTexts.some(t => t.type === 'modal')) factors.push('Complex UI components');
    if (extractedTexts.some(t => t.text.length > 50)) factors.push('Long text content');

    let level = 'Simple';
    if (factors.length >= 3) level = 'Complex';
    else if (factors.length >= 1) level = 'Moderate';

    return { level, factors };
  }
}
