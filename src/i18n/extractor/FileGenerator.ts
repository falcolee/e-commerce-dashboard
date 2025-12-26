import { ExtractedText, TranslationMap } from '../types/TextExtraction';
import { KeyGenerator } from './KeyGenerator';
import * as fs from 'fs';
import * as path from 'path';

export class FileGenerator {
  private keyGenerator: KeyGenerator;

  constructor(keyFormat: 'camelCase' | 'snake_case' | 'kebab-case' = 'camelCase') {
    this.keyGenerator = new KeyGenerator(keyFormat);
  }

  generateTranslationFile(extractedTexts: ExtractedText[], outputPath: string): void {
    const translationMap = this.createTranslationMap(extractedTexts);
    this.writeTranslationFile(translationMap, outputPath);
  }

  createTranslationMap(extractedTexts: ExtractedText[]): TranslationMap {
    const translationMap: TranslationMap = {};
    const textToKeyMap = this.keyGenerator.generateKeysForExtractedTexts(extractedTexts);

    extractedTexts.forEach(extractedText => {
      const mapKey = KeyGenerator.createMapKey(extractedText.namespace, extractedText.text);
      const fullKey = textToKeyMap.get(mapKey);
      if (!fullKey) return;

      const [namespace, key] = fullKey.split('.');

      // Initialize namespace if it doesn't exist
      if (!translationMap[namespace]) {
        translationMap[namespace] = {};
      }

      // Add the translation
      translationMap[namespace][key] = extractedText.text;
    });

    // Sort keys within each namespace
    Object.keys(translationMap).forEach(namespace => {
      const sortedKeys = Object.keys(translationMap[namespace]).sort();
      const sortedNamespace: { [key: string]: string } = {};
      sortedKeys.forEach(key => {
        sortedNamespace[key] = translationMap[namespace][key];
      });
      translationMap[namespace] = sortedNamespace;
    });

    return translationMap;
  }

  private writeTranslationFile(translationMap: TranslationMap, outputPath: string): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Format JSON with proper indentation
      const jsonContent = JSON.stringify(translationMap, null, 2);

      // Write file
      fs.writeFileSync(outputPath, jsonContent, 'utf8');

      console.log(`✅ Translation file generated: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error writing translation file: ${error}`);
      throw error;
    }
  }

  mergeWithExistingFile(translationMap: TranslationMap, outputPath: string): TranslationMap {
    let existingMap: TranslationMap = {};

    // Read existing file if it exists
    if (fs.existsSync(outputPath)) {
      try {
        const existingContent = fs.readFileSync(outputPath, 'utf8');
        existingMap = JSON.parse(existingContent);
      } catch (error) {
        console.warn(`⚠️  Warning: Could not read existing translation file: ${error}`);
      }
    }

    // Merge new translations with existing ones
    const mergedMap: TranslationMap = { ...existingMap };

    Object.keys(translationMap).forEach(namespace => {
      if (!mergedMap[namespace]) {
        mergedMap[namespace] = {};
      }

      Object.keys(translationMap[namespace]).forEach(key => {
        // Only add new key if it doesn't exist
        if (!mergedMap[namespace][key]) {
          mergedMap[namespace][key] = translationMap[namespace][key];
        }
      });
    });

    return mergedMap;
  }

  generateTranslationFileWithMerge(extractedTexts: ExtractedText[], outputPath: string): void {
    const newTranslationMap = this.createTranslationMap(extractedTexts);
    const mergedMap = this.mergeWithExistingFile(newTranslationMap, outputPath);
    this.writeTranslationFile(mergedMap, outputPath);

    // Report statistics
    const totalNamespaces = Object.keys(mergedMap).length;
    const totalKeys = Object.values(mergedMap).reduce((sum, namespace) => sum + Object.keys(namespace).length, 0);
    const newKeys = extractedTexts.length;

    console.log(`📊 Translation file statistics:`);
    console.log(`   Total namespaces: ${totalNamespaces}`);
    console.log(`   Total keys: ${totalKeys}`);
    console.log(`   New keys added: ${newKeys}`);
  }

  validateTranslationFile(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Translation file does not exist: ${filePath}`);
        return false;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);

      // Validate structure
      if (typeof parsed !== 'object' || parsed === null) {
        console.error(`❌ Invalid translation file structure: not an object`);
        return false;
      }

      // Validate each namespace
      for (const [namespace, translations] of Object.entries(parsed)) {
        if (typeof namespace !== 'string' || namespace.trim() === '') {
          console.error(`❌ Invalid namespace: ${namespace}`);
          return false;
        }

        if (typeof translations !== 'object' || translations === null) {
          console.error(`❌ Invalid translations object in namespace: ${namespace}`);
          return false;
        }

        // Validate each translation
        for (const [key, value] of Object.entries(translations)) {
          if (typeof key !== 'string' || key.trim() === '') {
            console.error(`❌ Invalid translation key in namespace ${namespace}: ${key}`);
            return false;
          }

          if (typeof value !== 'string') {
            console.error(`❌ Invalid translation value in namespace ${namespace}.${key}: must be string`);
            return false;
          }
        }
      }

      console.log(`✅ Translation file is valid: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Error validating translation file: ${error}`);
      return false;
    }
  }

  generateStatistics(translationMap: TranslationMap): void {
    const namespaces = Object.keys(translationMap);
    const totalKeys = namespaces.reduce((sum, ns) => sum + Object.keys(translationMap[ns]).length, 0);

    console.log(`📈 Translation Statistics:`);
    console.log(`   Total namespaces: ${namespaces.length}`);
    console.log(`   Total translation keys: ${totalKeys}`);

    namespaces.forEach(namespace => {
      const keyCount = Object.keys(translationMap[namespace]).length;
      console.log(`   ${namespace}: ${keyCount} keys`);
    });
  }
}
