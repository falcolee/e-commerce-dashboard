import { Node, JsxElement, CallExpression, StringLiteral, PropertyAssignment, SourceFile } from 'ts-morph';
import * as path from 'path';

export function isStaticTextNode(node: Node): boolean {
  if (node.getKindName() === 'StringLiteral') {
    const text = (node as StringLiteral).getLiteralValue();
    return text.trim().length > 0 && !isVariableText(text);
  }

  if (node.getKindName() === 'JsxText') {
    const text = node.getText().trim();
    return text.length > 0 && !isVariableText(text);
  }

  return false;
}

export function isVariableText(text: string): boolean {
  // Check for template literals with variables
  return text.includes('${') || text.includes('{') || text.includes('}');
}

export function extractTextFromJsxElement(element: JsxElement): string[] {
  const texts: string[] = [];

  // Extract from direct text content
  element.getChildren().forEach(child => {
    if (child.getKindName() === 'JsxText') {
      const text = child.getText().trim();
      if (text && !isVariableText(text)) {
        texts.push(text);
      }
    }
  });

  // Extract from opening element props like children, title, etc.
  try {
    const openingElement = element.getOpeningElement();
    if (openingElement) {
      openingElement.getAttributes().forEach(attr => {
        if (attr.getKindName() === 'JsxAttribute') {
          const initializer = attr.getInitializer();
          if (initializer && isStaticTextNode(initializer)) {
            const text = (initializer as StringLiteral).getLiteralValue();
            if (text && !isVariableText(text)) {
              texts.push(text);
            }
          }
        }
      });
    }
  } catch (error) {
    // Ignore errors during attribute extraction
  }

  return texts;
}

export function extractTextFromCallExpression(expression: CallExpression): string[] {
  const texts: string[] = [];
  const functionName = expression.getExpression().getText();

  // Check for common message/notification calls
  if (['message.success', 'message.error', 'message.info', 'message.warning',
       'notification.success', 'notification.error', 'notification.info', 'notification.warning',
       'Modal.success', 'Modal.error', 'Modal.info', 'Modal.warning'].includes(functionName)) {

    const args = expression.getArguments();
    args.forEach(arg => {
      if (arg.getKindName() === 'StringLiteral') {
        const text = (arg as StringLiteral).getLiteralValue();
        if (text && !isVariableText(text)) {
          texts.push(text);
        }
      } else if (arg.getKindName() === 'ObjectLiteralExpression') {
        // Extract from message property in object
        const properties = arg.getProperties();
        properties.forEach(prop => {
          if (prop.getKindName() === 'PropertyAssignment') {
            const name = prop.getName();
            if (['message', 'content', 'title'].includes(name)) {
              const initializer = (prop as PropertyAssignment).getInitializer();
              if (initializer && initializer.getKindName() === 'StringLiteral') {
                const text = (initializer as StringLiteral).getLiteralValue();
                if (text && !isVariableText(text)) {
                  texts.push(text);
                }
              }
            }
          }
        });
      }
    });
  }

  return texts;
}

export function extractTextFromProperties(properties: PropertyAssignment[]): string[] {
  const texts: string[] = [];

  properties.forEach(prop => {
    const name = prop.getName();
    const initializer = prop.getInitializer();

    // Target common text properties
    if (initializer && ['title', 'placeholder', 'label', 'content', 'message', 'description'].includes(name)) {
      if (initializer.getKindName() === 'StringLiteral') {
        const text = (initializer as StringLiteral).getLiteralValue();
        if (text && !isVariableText(text)) {
          texts.push(text);
        }
      }
    }
  });

  return texts;
}

export function detectNamespaceFromPath(filePath: string): string {
  const normalizedPath = path.normalize(filePath);
  const parts = normalizedPath.split(path.sep);

  // Extract namespace from file path
  // src/pages/admin/Products.tsx -> products
  // src/pages/Login.tsx -> auth
  // src/pages/admin/Dashboard.tsx -> dashboard
  // src/pages/admin/Orders.tsx -> orders

  if (parts.includes('pages')) {
    const pageIndex = parts.indexOf('pages');
    if (pageIndex < parts.length - 1) {
      const fileName = parts[parts.length - 1];
      const baseName = path.basename(fileName, path.extname(fileName));

      // Map file names to namespaces
      const namespaceMap: { [key: string]: string } = {
        'Login': 'auth',
        'Products': 'products',
        'Orders': 'orders',
        'Dashboard': 'dashboard'
      };

      return namespaceMap[baseName] || baseName.toLowerCase();
    }
  }

  return 'common';
}

export function generateLineColumnInfo(node: Node): { line: number; column: number } {
  const sourceFile = node.getSourceFile();
  const lineAndColumn = sourceFile.getLineAndColumnAtPos(node.getStart());
  return {
    line: lineAndColumn.line,
    column: lineAndColumn.column
  };
}