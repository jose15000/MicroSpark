import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { extractClassTokens } from "./class-parser";

/**
 * Returns the tag name of a JSX element (e.g. 'div', 'h1', 'svg', 'Header').
 */
export function getJSXTagName(node: t.JSXElement | t.JSXOpeningElement): string | null {
  const opening = node.type === "JSXElement" ? node.openingElement : node;
  const nameNode = opening.name;

  if (t.isJSXIdentifier(nameNode)) {
    return nameNode.name;
  }
  if (t.isJSXMemberExpression(nameNode)) {
    const objectName = t.isJSXIdentifier(nameNode.object)
      ? nameNode.object.name
      : "Component";
    return `${objectName}.${nameNode.property.name}`;
  }
  return null;
}

/**
 * Extracts raw string literals from template literals, binary expressions, conditional expressions,
 * or identifiers resolved via scope if available.
 */
export function extractStringChunks(expr: t.Expression, path?: NodePath<any>): string[] {
  if (t.isStringLiteral(expr)) {
    return [expr.value];
  }
  if (t.isTemplateLiteral(expr)) {
    const quasis = expr.quasis.map((q) => q.value.raw || q.value.cooked || "");
    const exprChunks = expr.expressions.flatMap((e) =>
      t.isExpression(e) ? extractStringChunks(e, path) : []
    );
    return [...quasis, ...exprChunks];
  }
  if (t.isBinaryExpression(expr) && expr.operator === "+") {
    return [
      ...extractStringChunks(expr.left as t.Expression, path),
      ...extractStringChunks(expr.right as t.Expression, path),
    ];
  }
  if (t.isConditionalExpression(expr)) {
    return [
      ...extractStringChunks(expr.consequent as t.Expression, path),
      ...extractStringChunks(expr.alternate as t.Expression, path),
    ];
  }
  if (t.isLogicalExpression(expr)) {
    return [
      ...extractStringChunks(expr.left as t.Expression, path),
      ...extractStringChunks(expr.right as t.Expression, path),
    ];
  }
  if (t.isArrayExpression(expr)) {
    return expr.elements.flatMap((el) =>
      el && !t.isSpreadElement(el) ? extractStringChunks(el as t.Expression, path) : []
    );
  }
  if (t.isCallExpression(expr)) {
    // Matches clsx("...", "..."), cn("...", "...") or helper calls
    return expr.arguments.flatMap((arg) =>
      t.isExpression(arg) ? extractStringChunks(arg, path) : []
    );
  }
  if (t.isIdentifier(expr) && path && path.scope) {
    const binding = path.scope.getBinding(expr.name);
    if (binding && binding.path.isVariableDeclarator()) {
      const init = binding.path.node.init;
      if (init && t.isExpression(init)) {
        return extractStringChunks(init, binding.path);
      }
    }
  }
  return [];
}

/**
 * Finds and extracts all classes from className or class attributes on a JSXOpeningElement.
 * Also parses class names from expressions, conditionals, clsx/cn calls, and bound variables.
 */
export function getJSXClasses(opening: t.JSXOpeningElement, path?: NodePath<any>): string[] {
  const classTokens: string[] = [];

  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const attrName = attr.name.name;
      if (attrName === "className" || attrName === "class") {
        const val = attr.value;
        if (t.isStringLiteral(val)) {
          classTokens.push(...extractClassTokens(val.value));
        } else if (t.isJSXExpressionContainer(val) && t.isExpression(val.expression)) {
          const chunks = extractStringChunks(val.expression, path);
          for (const chunk of chunks) {
            classTokens.push(...extractClassTokens(chunk));
          }
        }
      }
    }
  }

  return classTokens;
}

/**
 * Retrieves inline style properties and values from style={{ ... }} attribute.
 */
export function getJSXInlineStyles(opening: t.JSXOpeningElement): Record<string, string | number> {
  const styles: Record<string, string | number> = {};
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "style" })) {
      if (t.isJSXExpressionContainer(attr.value) && t.isObjectExpression(attr.value.expression)) {
        for (const prop of attr.value.expression.properties) {
          if (t.isObjectProperty(prop)) {
            let key = "";
            if (t.isIdentifier(prop.key)) {
              key = prop.key.name;
            } else if (t.isStringLiteral(prop.key)) {
              key = prop.key.value;
            }
            if (key) {
              if (t.isStringLiteral(prop.value)) {
                styles[key] = prop.value.value;
              } else if (t.isNumericLiteral(prop.value)) {
                styles[key] = prop.value.value;
              }
            }
          }
        }
      }
    }
  }
  return styles;
}

/**
 * Returns child JSX elements of a JSXElement, ignoring whitespace and empty JSXText.
 */
export function getJSXChildrenElements(element: t.JSXElement): t.JSXElement[] {
  return element.children.filter((child): child is t.JSXElement => t.isJSXElement(child));
}

/**
 * Information extracted from an array .map() call inside JSX or expressions.
 */
export interface MapExpressionInfo {
  callExpr: t.CallExpression;
  arrayName?: string;
  arrayLiteral?: t.ArrayExpression;
  itemCount?: number;
  returnedElements: t.JSXElement[];
  isLikelyMap: boolean;
}

/**
 * Detects if a node or expression contains an Array .map() call and inspects its returned JSX.
 */
export function findMapExpressions(element: t.JSXElement, path?: NodePath<any>): MapExpressionInfo[] {
  const results: MapExpressionInfo[] = [];

  function inspectCall(call: t.CallExpression, currentPath?: NodePath<any>) {
    if (
      t.isMemberExpression(call.callee) &&
      t.isIdentifier(call.callee.property, { name: "map" })
    ) {
      const arg = call.arguments[0];
      const returnedJSX: t.JSXElement[] = [];

      let arrayLit: t.ArrayExpression | undefined;
      let arrayName: string | undefined;

      if (t.isArrayExpression(call.callee.object)) {
        arrayLit = call.callee.object;
      } else if (t.isIdentifier(call.callee.object)) {
        arrayName = call.callee.object.name;
        if (currentPath && currentPath.scope) {
          const binding = currentPath.scope.getBinding(arrayName);
          if (binding && binding.path.isVariableDeclarator()) {
            const init = binding.path.node.init;
            if (init && t.isArrayExpression(init)) {
              arrayLit = init;
            }
          }
        }
      }

      if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) {
        if (t.isJSXElement(arg.body)) {
          returnedJSX.push(arg.body);
        } else if (t.isBlockStatement(arg.body)) {
          for (const stmt of arg.body.body) {
            if (t.isReturnStatement(stmt) && stmt.argument && t.isJSXElement(stmt.argument)) {
              returnedJSX.push(stmt.argument);
            }
          }
        }
      }

      results.push({
        callExpr: call,
        arrayName,
        arrayLiteral: arrayLit,
        itemCount: arrayLit ? arrayLit.elements.length : undefined,
        returnedElements: returnedJSX,
        isLikelyMap: true,
      });
    }
  }

  for (const child of element.children) {
    if (t.isJSXExpressionContainer(child) && t.isCallExpression(child.expression)) {
      inspectCall(child.expression, path);
    }
  }

  return results;
}

/**
 * Checks if a JSX element or its children contains any text or heading.
 */
export function hasTextContent(element: t.JSXElement): boolean {
  for (const child of element.children) {
    if (t.isJSXText(child) && child.value.trim().length > 0) return true;
    if (t.isJSXExpressionContainer(child) && !t.isJSXEmptyExpression(child.expression)) return true;
    if (t.isJSXElement(child) && hasTextContent(child)) return true;
  }
  return false;
}

/**
 * Checks if a JSX element represents an image, video, canvas or media/mockup component.
 */
export function isMediaElement(element: t.JSXElement): boolean {
  const tagName = getJSXTagName(element)?.toLowerCase() || "";
  if (["img", "image", "video", "canvas", "picture", "svg"].includes(tagName)) {
    return true;
  }
  if (/mockup|preview|screenshot|heroimage|illustration|player|video/i.test(tagName)) {
    return true;
  }
  const children = getJSXChildrenElements(element);
  if (children.length > 0 && children.every((c) => isMediaElement(c)) && !hasTextContent(element)) {
    return true;
  }
  return false;
}

/**
 * Concatenates and returns all text inside a JSX element, expressions, identifiers, and children.
 */
export function getTextContent(element: t.JSXElement, path?: NodePath<any>): string {
  let text = "";
  for (const child of element.children) {
    if (t.isJSXText(child)) {
      text += " " + child.value.trim();
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isStringLiteral(child.expression)) {
        text += " " + child.expression.value;
      } else if (t.isTemplateLiteral(child.expression)) {
        const parts = child.expression.quasis.map((q) => q.value.raw || q.value.cooked || "");
        text += " " + parts.join(" ");
      } else if (t.isIdentifier(child.expression) && path && path.scope) {
        const binding = path.scope.getBinding(child.expression.name);
        if (binding && binding.path.isVariableDeclarator()) {
          const init = binding.path.node.init;
          if (init && t.isStringLiteral(init)) {
            text += " " + init.value;
          } else if (init && t.isTemplateLiteral(init)) {
            text += " " + init.quasis.map((q) => q.value.raw || q.value.cooked || "").join(" ");
          }
        }
      }
    } else if (t.isJSXElement(child)) {
      text += " " + getTextContent(child, path);
    }
  }
  return text.trim();
}

/**
 * Recursively retrieves all descendant JSXElements under a given element.
 */
export function getAllJSXDescendants(element: t.JSXElement): t.JSXElement[] {
  const result: t.JSXElement[] = [];
  for (const child of element.children) {
    if (t.isJSXElement(child)) {
      result.push(child);
      result.push(...getAllJSXDescendants(child));
    }
  }
  return result;
}

/**
 * Recursively extracts all string values from an AST node (literals, template literals, identifiers in scope).
 */
export function getAllStringsInNode(node: t.Node, path?: NodePath<any>): string[] {
  const strings: string[] = [];

  function walk(curr: t.Node) {
    if (t.isStringLiteral(curr)) {
      strings.push(curr.value);
    } else if (t.isTemplateLiteral(curr)) {
      for (const q of curr.quasis) {
        strings.push(q.value.raw || q.value.cooked || "");
      }
    } else if (t.isJSXText(curr)) {
      const val = curr.value.trim();
      if (val) strings.push(val);
    } else if (t.isIdentifier(curr) && path && path.scope) {
      const binding = path.scope.getBinding(curr.name);
      if (binding && binding.path.isVariableDeclarator()) {
        const init = binding.path.node.init;
        if (init && (t.isStringLiteral(init) || t.isTemplateLiteral(init) || t.isArrayExpression(init) || t.isObjectExpression(init))) {
          if (init !== curr) {
            walk(init);
          }
        }
      }
    } else if (t.isObjectExpression(curr)) {
      for (const p of curr.properties) {
        if (t.isObjectProperty(p)) {
          walk(p.value);
        }
      }
    } else if (t.isArrayExpression(curr)) {
      for (const el of curr.elements) {
        if (el && !t.isSpreadElement(el)) {
          walk(el);
        }
      }
    } else if (t.isJSXElement(curr)) {
      for (const child of curr.children) {
        walk(child);
      }
    }
  }

  walk(node);
  return strings;
}


