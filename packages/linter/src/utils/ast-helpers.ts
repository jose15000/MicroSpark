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
 * Extracts raw string literals from template literals or binary expressions (e.g. 'foo ' + 'bar').
 */
function extractStringChunks(expr: t.Expression): string[] {
  if (t.isStringLiteral(expr)) {
    return [expr.value];
  }
  if (t.isTemplateLiteral(expr)) {
    return expr.quasis.map((q) => q.value.raw || q.value.cooked || "");
  }
  if (t.isBinaryExpression(expr) && expr.operator === "+") {
    return [
      ...extractStringChunks(expr.left as t.Expression),
      ...extractStringChunks(expr.right as t.Expression),
    ];
  }
  if (t.isConditionalExpression(expr)) {
    return [
      ...extractStringChunks(expr.consequent as t.Expression),
      ...extractStringChunks(expr.alternate as t.Expression),
    ];
  }
  if (t.isLogicalExpression(expr)) {
    return [
      ...extractStringChunks(expr.left as t.Expression),
      ...extractStringChunks(expr.right as t.Expression),
    ];
  }
  if (t.isArrayExpression(expr)) {
    return expr.elements.flatMap((el) =>
      el && !t.isSpreadElement(el) ? extractStringChunks(el as t.Expression) : []
    );
  }
  if (t.isCallExpression(expr)) {
    // Matches clsx("...", "..."), cn("...", "...")
    return expr.arguments.flatMap((arg) =>
      t.isExpression(arg) ? extractStringChunks(arg) : []
    );
  }
  return [];
}

/**
 * Finds and extracts all classes from className or class attributes on a JSXOpeningElement.
 */
export function getJSXClasses(opening: t.JSXOpeningElement): string[] {
  const classTokens: string[] = [];

  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const attrName = attr.name.name;
      if (attrName === "className" || attrName === "class") {
        const val = attr.value;
        if (t.isStringLiteral(val)) {
          classTokens.push(...extractClassTokens(val.value));
        } else if (t.isJSXExpressionContainer(val) && t.isExpression(val.expression)) {
          const chunks = extractStringChunks(val.expression);
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
 * Returns child JSX elements of a JSXElement, ignoring whitespace and empty JSXText.
 */
export function getJSXChildrenElements(element: t.JSXElement): t.JSXElement[] {
  return element.children.filter((child): child is t.JSXElement => t.isJSXElement(child));
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
  if (/mockup|preview|screenshot|heroimage|illustration/i.test(tagName)) {
    return true;
  }
  const children = getJSXChildrenElements(element);
  if (children.length > 0 && children.every((c) => isMediaElement(c)) && !hasTextContent(element)) {
    return true;
  }
  return false;
}
