import { ExtractedText } from '../types/TextExtraction';
import { detectNamespaceFromPath } from '../utils/astHelpers';
import * as path from 'path';

export class KeyGenerator {
  private keyFormat: 'camelCase' | 'snake_case' | 'kebab-case';
  private usedKeys: Set<string> = new Set();

  constructor(keyFormat: 'camelCase' | 'snake_case' | 'kebab-case' = 'camelCase') {
    this.keyFormat = keyFormat;
  }

  generateKey(text: string, context: string, namespace: string): string {
    let baseKey = this.createBaseKey(text, context);

    // Apply formatting
    baseKey = this.normalizeKey(baseKey);

    // Ensure uniqueness
    let finalKey = baseKey;
    let counter = 1;

    while (this.usedKeys.has(`${namespace}.${finalKey}`)) {
      finalKey = `${baseKey}${counter}`;
      counter++;
    }

    this.usedKeys.add(`${namespace}.${finalKey}`);
    return finalKey;
  }

  detectNamespace(filePath: string): string {
    return detectNamespaceFromPath(filePath);
  }

  normalizeKey(key: string): string {
    switch (this.keyFormat) {
      case 'camelCase':
        return this.toCamelCase(key);
      case 'snake_case':
        return this.toSnakeCase(key);
      case 'kebab-case':
        return this.toKebabCase(key);
      default:
        return this.toCamelCase(key);
    }
  }

  validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') return false;

    // Key should start with a letter
    if (!/^[a-zA-Z]/.test(key)) return false;

    // Key should only contain letters, numbers, and separators
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) return false;

    // Key should not be too long
    if (key.length > 100) return false;

    return true;
  }

  private createBaseKey(text: string, context: string): string {
    // Clean the text first
    let key = text.trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Add context prefix if helpful
    if (context.includes('placeholder')) {
      key = `${key}Placeholder`;
    } else if (context.includes('title')) {
      key = `${key}Title`;
    } else if (context.includes('message')) {
      key = `${key}Message`;
    } else if (context.includes('label')) {
      key = `${key}Label`;
    }

    // Handle common patterns
    key = this.handleCommonPatterns(key);

    return key;
  }

  private handleCommonPatterns(key: string): string {
    const replacements: { [pattern: string]: string } = {
      'search': 'search',
      'filter': 'filter',
      'add': 'add',
      'create': 'create',
      'edit': 'edit',
      'update': 'update',
      'delete': 'delete',
      'save': 'save',
      'cancel': 'cancel',
      'confirm': 'confirm',
      'submit': 'submit',
      'reset': 'reset',
      'clear': 'clear',
      'close': 'close',
      'open': 'open',
      'view': 'view',
      'show': 'show',
      'hide': 'hide',
      'enable': 'enable',
      'disable': 'disable',
      'active': 'active',
      'inactive': 'inactive',
      'enabled': 'enabled',
      'disabled': 'disabled',
      'status': 'status',
      'name': 'name',
      'email': 'email',
      'password': 'password',
      'username': 'username',
      'login': 'login',
      'logout': 'logout',
      'signin': 'signIn',
      'signout': 'signOut',
      'signup': 'signUp',
      'register': 'register',
      'profile': 'profile',
      'settings': 'settings',
      'dashboard': 'dashboard',
      'overview': 'overview',
      'details': 'details',
      'information': 'information',
      'description': 'description',
      'content': 'content',
      'title': 'title',
      'heading': 'heading',
      'subtitle': 'subtitle',
      'header': 'header',
      'footer': 'footer',
      'navigation': 'navigation',
      'menu': 'menu',
      'sidebar': 'sidebar',
      'main': 'main',
      'primary': 'primary',
      'secondary': 'secondary',
      'success': 'success',
      'error': 'error',
      'warning': 'warning',
      'info': 'info',
      'loading': 'loading',
      'loaded': 'loaded',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'pending': 'pending',
      'inprogress': 'inProgress',
      'done': 'done',
      'ready': 'ready',
      'available': 'available',
      'unavailable': 'unavailable',
      'online': 'online',
      'offline': 'offline',
      'connected': 'connected',
      'disconnected': 'disconnected',
      'yes': 'yes',
      'no': 'no',
      'ok': 'ok',
      'okay': 'okay',
      'accept': 'accept',
      'decline': 'decline',
      'reject': 'reject',
      'approve': 'approve',
      'deny': 'deny',
      'allow': 'allow',
      'forbid': 'forbid',
      'permit': 'permit',
      'restrict': 'restrict',
      'limit': 'limit',
      'unlimited': 'unlimited',
      'total': 'total',
      'count': 'count',
      'number': 'number',
      'quantity': 'quantity',
      'amount': 'amount',
      'price': 'price',
      'cost': 'cost',
      'value': 'value',
      'rating': 'rating',
      'score': 'score',
      'rank': 'rank',
      'position': 'position',
      'order': 'order',
      'sort': 'sort',
      'arrange': 'arrange',
      'organize': 'organize',
      'group': 'group',
      'category': 'category',
      'type': 'type',
      'kind': 'kind',
      'class': 'class',
      'style': 'style',
      'theme': 'theme',
      'color': 'color',
      'size': 'size',
      'length': 'length',
      'width': 'width',
      'height': 'height',
      'weight': 'weight',
      'date': 'date',
      'time': 'time',
      'period': 'period',
      'duration': 'duration',
      'schedule': 'schedule',
      'calendar': 'calendar',
      'today': 'today',
      'tomorrow': 'tomorrow',
      'yesterday': 'yesterday',
      'now': 'now',
      'current': 'current',
      'previous': 'previous',
      'next': 'next',
      'first': 'first',
      'last': 'last',
      'beginning': 'beginning',
      'end': 'end',
      'start': 'start',
      'stop': 'stop',
      'pause': 'pause',
      'resume': 'resume',
      'continue': 'continue',
      'finish': 'finish',
      'complete': 'complete',
      'incomplete': 'incomplete',
      'partial': 'partial',
      'full': 'full',
      'empty': 'empty',
      'blank': 'blank',
      'null': 'null',
      'undefined': 'undefined',
      'invalid': 'invalid',
      'valid': 'valid',
      'correct': 'correct',
      'incorrect': 'incorrect',
      'right': 'right',
      'wrong': 'wrong',
      'true': 'true',
      'false': 'false',
      'on': 'on',
      'off': 'off'
    };

    return replacements[key.toLowerCase()] || key;
  }

  private toCamelCase(str: string): string {
    return str
      .split(/[\s_-]+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  private toSnakeCase(str: string): string {
    return str
      .split(/[\s-]+/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  private toKebabCase(str: string): string {
    return str
      .split(/[\s_]+/)
      .map(word => word.toLowerCase())
      .join('-');
  }

  generateKeysForExtractedTexts(extractedTexts: ExtractedText[]): Map<string, string> {
    const textToKeyMap = new Map<string, string>();

    // Group by namespace first
    const namespaceGroups = new Map<string, ExtractedText[]>();

    extractedTexts.forEach(extractedText => {
      if (!namespaceGroups.has(extractedText.namespace)) {
        namespaceGroups.set(extractedText.namespace, []);
      }
      namespaceGroups.get(extractedText.namespace)!.push(extractedText);
    });

    // Generate keys within each namespace
    namespaceGroups.forEach((texts, namespace) => {
      texts.forEach(extractedText => {
        const key = this.generateKey(extractedText.text, extractedText.context, namespace);
        const fullKey = `${namespace}.${key}`;
        const mapKey = KeyGenerator.createMapKey(namespace, extractedText.text);
        textToKeyMap.set(mapKey, fullKey);
      });
    });

    return textToKeyMap;
  }

  static createMapKey(namespace: string, text: string): string {
    return `${namespace}:${text}`;
  }
}
