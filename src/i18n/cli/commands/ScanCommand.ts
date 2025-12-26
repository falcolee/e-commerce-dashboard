import { glob } from 'glob';
import { ScanResult, I18nToolConfig } from '../../types/TextExtraction';
import { getConfig, isTargetFile } from '../../config';
import chalk from 'chalk';

export class ScanCommand {
  async execute(targetPaths: string[]): Promise<ScanResult> {
    const config = getConfig();
    const startTime = Date.now();

    console.log(chalk.blue('🔍 Scanning for target files...'));

    let files: string[] = [];

    if (targetPaths.length > 0) {
      // Use provided target paths
      for (const targetPath of targetPaths) {
        const pathFiles = await this.expandPath(targetPath, config);
        files.push(...pathFiles);
      }
    } else {
      // Use default config
      files = await this.scanWithConfig(config);
    }

    // Remove duplicates
    files = [...new Set(files)];

    const endTime = Date.now();
    const scanTime = endTime - startTime;
    const scanResult = this.createScanResult(files, scanTime);

    console.log(chalk.green(`✅ Scan completed in ${scanResult.scanTime}ms`));
    console.log(chalk.green(`📁 Found ${scanResult.totalFiles} target files`));

    if (scanResult.files.length > 0) {
      console.log(chalk.blue('\nTarget files:'));
      scanResult.files.forEach(file => {
        console.log(chalk.white(`  - ${file}`));
      });
    }

    return scanResult;
  }

  private async expandPath(targetPath: string, config: I18nToolConfig): Promise<string[]> {
    // Handle file paths vs directory paths
    if (await this.isFile(targetPath)) {
      if (isTargetFile(targetPath, config)) {
        return [targetPath];
      }
      return [];
    }

    // Handle directory paths - add glob pattern
    const pattern = targetPath.endsWith('/') ? `${targetPath}**/*.{ts,tsx}` : `${targetPath}/**/*.{ts,tsx}`;
    const files = await glob(pattern, {
      ignore: config.excludePatterns,
      absolute: true
    });

    return files.filter(file => isTargetFile(file, config));
  }

  private async scanWithConfig(config: I18nToolConfig): Promise<string[]> {
    const files: string[] = [];

    for (const includeDir of config.includeDirs) {
      const pattern = `${includeDir}/**/*.{ts,tsx}`;
      const foundFiles = await glob(pattern, {
        ignore: config.excludePatterns,
        absolute: true
      });
      files.push(...foundFiles);
    }

    return files;
  }

  private async isFile(path: string): Promise<boolean> {
    try {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  createScanResult(files: string[], scanTime: number): ScanResult {
    return {
      files,
      totalFiles: files.length,
      scanTime
    };
  }

  async saveScanResults(scanResult: ScanResult, outputPath: string): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write scan results
      fs.writeFileSync(outputPath, JSON.stringify(scanResult, null, 2));
      console.log(chalk.blue(`💾 Scan results saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error saving scan results: ${error}`));
      throw error;
    }
  }
}
