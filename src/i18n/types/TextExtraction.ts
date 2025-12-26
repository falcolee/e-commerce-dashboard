export interface ExtractedText {
  id: string;
  text: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  context: string;
  namespace: string;
  type: 'jsx' | 'prop' | 'call' | 'message' | 'modal' | 'table' | 'form';
}

export interface TranslationMap {
  [namespace: string]: {
    [key: string]: string;
  };
}

export interface CodeTransform {
  filePath: string;
  transformations: TextReplacement[];
  requiredImports: string[];
  requiredHooks: string[];
}

export interface TextReplacement {
  id: string;
  key: string;
  originalText: string;
  position: {
    line: number;
    column: number;
    start: number;
    end: number;
  };
}

export interface I18nToolConfig {
  targetFiles: string[];
  outputPath: string;
  excludePatterns: string[];
  keyFormat: 'camelCase' | 'snake_case' | 'kebab-case';
  namespaceDetection: 'filepath' | 'directory' | 'manual';
  antDesignIntegration: boolean;
  includeDirs: string[];
  fileExtensions: string[];
}

export interface ScanResult {
  files: string[];
  totalFiles: number;
  scanTime: number;
}

export interface ExtractResult {
  extractedTexts: ExtractedText[];
  translationMap: TranslationMap;
  totalTexts: number;
  uniqueNamespaces: string[];
}

export interface TransformResult {
  transformedFiles: string[];
  totalTransformations: number;
  errors: string[];
}