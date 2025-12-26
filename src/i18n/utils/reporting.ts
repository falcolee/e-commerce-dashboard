import { ScanResult, TransformResult, ExtractedText, TranslationMap } from '../types/TextExtraction';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportData {
  timestamp: string;
  scanResults?: ScanResult;
  transformResults?: TransformResult;
  extractionStats?: ExtractionStats;
  translationStats?: TranslationStats;
}

export interface ExtractionStats {
  totalTexts: number;
  textsByNamespace: { [namespace: string]: number };
  averageTextLength: number;
  longestText: string;
  shortestText: string;
  duplicatesFound: number;
}

export interface TranslationStats {
  totalNamespaces: number;
  totalKeys: number;
  keysByNamespace: { [namespace: string]: number };
  averageKeyLength: number;
}

export class ReportingManager {
  private reportsDir: string;

  constructor(reportsDir: string = './i18n-reports') {
    this.reportsDir = reportsDir;
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  generateExtractionStats(extractedTexts: ExtractedText[]): ExtractionStats {
    const textsByNamespace: { [namespace: string]: number } = {};
    let totalLength = 0;
    let longestText = '';
    let shortestText = '';
    const textSet = new Set<string>();

    extractedTexts.forEach(extractedText => {
      const namespace = extractedText.namespace || 'common';
      textsByNamespace[namespace] = (textsByNamespace[namespace] || 0) + 1;

      const text = extractedText.text;
      totalLength += text.length;

      if (text.length > longestText.length) {
        longestText = text;
      }

      if (shortestText === '' || text.length < shortestText.length) {
        shortestText = text;
      }

      textSet.add(text);
    });

    const duplicatesFound = extractedTexts.length - textSet.size;

    return {
      totalTexts: extractedTexts.length,
      textsByNamespace,
      averageTextLength: extractedTexts.length > 0 ? Math.round(totalLength / extractedTexts.length) : 0,
      longestText,
      shortestText,
      duplicatesFound
    };
  }

  generateTranslationStats(translationMap: TranslationMap): TranslationStats {
    const keysByNamespace: { [namespace: string]: number } = {};
    let totalKeyLength = 0;
    let totalKeys = 0;

    Object.entries(translationMap).forEach(([namespace, translations]) => {
      const keyCount = Object.keys(translations).length;
      keysByNamespace[namespace] = keyCount;
      totalKeys += keyCount;

      Object.keys(translations).forEach(key => {
        totalKeyLength += key.length;
      });
    });

    return {
      totalNamespaces: Object.keys(translationMap).length,
      totalKeys,
      keysByNamespace,
      averageKeyLength: totalKeys > 0 ? Math.round(totalKeyLength / totalKeys) : 0
    };
  }

  generateScanReport(scanResult: ScanResult): string {
    const report = `
# Scan Report
Generated: ${new Date().toISOString()}

## Summary
- Total files scanned: ${scanResult.totalFiles}
- Scan time: ${scanResult.scanTime}ms
- Average time per file: ${scanResult.totalFiles > 0 ? Math.round(scanResult.scanTime / scanResult.totalFiles) : 0}ms

## Files Found
${scanResult.files.map(file => `- ${file}`).join('\n')}
    `.trim();

    return report;
  }

  generateTransformReport(transformResult: TransformResult): string {
    const successRate = transformResult.transformedFiles.length > 0
      ? Math.round((transformResult.totalTransformations / transformResult.transformedFiles.length) * 100)
      : 0;

    const report = `
# Transform Report
Generated: ${new Date().toISOString()}

## Summary
- Files processed: ${transformResult.transformedFiles.length}
- Successful transformations: ${transformResult.totalTransformations}
- Errors encountered: ${transformResult.errors.length}
- Success rate: ${successRate}%

## Transformed Files
${transformResult.transformedFiles.map(file => `- ✅ ${file}`).join('\n')}

${transformResult.errors.length > 0 ? `
## Errors
${transformResult.errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}
    `.trim();

    return report;
  }

  generateFullReport(reportData: ReportData): string {
    let report = `# I18n Tool Full Report
Generated: ${reportData.timestamp}
`;

    if (reportData.scanResults) {
      report += '\n\n## Scan Results\n';
      report += this.generateScanReport(reportData.scanResults);
    }

    if (reportData.transformResults) {
      report += '\n\n## Transform Results\n';
      report += this.generateTransformReport(reportData.transformResults);
    }

    if (reportData.extractionStats) {
      report += '\n\n## Extraction Statistics\n';
      report += this.formatExtractionStats(reportData.extractionStats);
    }

    if (reportData.translationStats) {
      report += '\n\n## Translation Statistics\n';
      report += this.formatTranslationStats(reportData.translationStats);
    }

    return report;
  }

  private formatExtractionStats(stats: ExtractionStats): string {
    return `
- Total texts extracted: ${stats.totalTexts}
- Duplicates found: ${stats.duplicatesFound}
- Average text length: ${stats.averageTextLength} characters
- Longest text: "${stats.longestText.substring(0, 100)}${stats.longestText.length > 100 ? '...' : ''}"
- Shortest text: "${stats.shortestText}"

### Texts by Namespace
${Object.entries(stats.textsByNamespace).map(([namespace, count]) => `- ${namespace}: ${count}`).join('\n')}
    `.trim();
  }

  private formatTranslationStats(stats: TranslationStats): string {
    return `
- Total namespaces: ${stats.totalNamespaces}
- Total translation keys: ${stats.totalKeys}
- Average key length: ${stats.averageKeyLength} characters

### Keys by Namespace
${Object.entries(stats.keysByNamespace).map(([namespace, count]) => `- ${namespace}: ${count}`).join('\n')}
    `.trim();
  }

  async saveReport(reportContent: string, fileName: string): Promise<void> {
    const filePath = path.join(this.reportsDir, fileName);

    try {
      fs.writeFileSync(filePath, reportContent, 'utf8');
      console.log(`📄 Report saved: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error saving report: ${error}`);
      throw error;
    }
  }

  async saveJsonReport(reportData: ReportData, fileName: string): Promise<void> {
    const filePath = path.join(this.reportsDir, fileName);

    try {
      const jsonContent = JSON.stringify(reportData, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf8');
      console.log(`📄 JSON report saved: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error saving JSON report: ${error}`);
      throw error;
    }
  }

  async generateAndSaveFullReport(reportData: ReportData): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFileName = `i18n-report-${timestamp}.md`;
    const jsonFileName = `i18n-report-${timestamp}.json`;

    const reportContent = this.generateFullReport(reportData);

    await Promise.all([
      this.saveReport(reportContent, reportFileName),
      this.saveJsonReport(reportData, jsonFileName)
    ]);
  }

  listExistingReports(): string[] {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        return [];
      }

      return fs.readdirSync(this.reportsDir)
        .filter(file => file.endsWith('.md') || file.endsWith('.json'))
        .sort()
        .reverse();
    } catch (error) {
      console.error(`❌ Error listing reports: ${error}`);
      return [];
    }
  }

  async loadReport(fileName: string): Promise<string | null> {
    const filePath = path.join(this.reportsDir, fileName);

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Report file not found: ${filePath}`);
        return null;
      }

      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error loading report: ${error}`);
      return null;
    }
  }

  async cleanOldReports(keepCount: number = 10): Promise<void> {
    try {
      const reports = this.listExistingReports();
      const reportsToDelete = reports.slice(keepCount);

      for (const report of reportsToDelete) {
        const filePath = path.join(this.reportsDir, report);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old report: ${report}`);
      }

      if (reportsToDelete.length > 0) {
        console.log(`✅ Cleaned ${reportsToDelete.length} old reports`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning old reports: ${error}`);
    }
  }

  consoleLogReport(reportContent: string): void {
    console.log('\n📋 ' + '='.repeat(50));
    console.log(reportContent);
    console.log('='.repeat(50) + '\n');
  }
}