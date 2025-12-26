import { I18nToolConfig } from '../types/TextExtraction';
import * as path from 'path';

export const defaultConfig: I18nToolConfig = {
  targetFiles: [
    'src/pages/admin/Products.tsx',
    'src/pages/admin/Orders.tsx',
    'src/pages/Login.tsx',
    'src/pages/admin/Dashboard.tsx'
  ],
  outputPath: 'src/locales/en/common.json',
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.tsx',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.spec.ts'
  ],
  keyFormat: 'camelCase',
  namespaceDetection: 'filepath',
  antDesignIntegration: true,
  includeDirs: ['src'],
  fileExtensions: ['.tsx', '.ts']
};

export function getConfig(): I18nToolConfig {
  // For future: could read from config file
  return defaultConfig;
}

export function getOutputPath(outputPath?: string): string {
  if (outputPath) {
    return path.resolve(outputPath);
  }
  return path.resolve(defaultConfig.outputPath);
}

export function isTargetFile(filePath: string, config: I18nToolConfig): boolean {
  const ext = path.extname(filePath);
  const isExcluded = config.excludePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filePath);
  });

  return config.fileExtensions.includes(ext) && !isExcluded;
}