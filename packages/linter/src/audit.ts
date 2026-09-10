import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import type { LintResult, LintViolation, Rule, RuleContext } from "./types";
import { allRules } from "./rules";

const traverse = (
  typeof _traverse === "function"
    ? _traverse
    : (_traverse as unknown as { default: typeof _traverse }).default || _traverse
) as typeof _traverse;

export interface AuditOptions {
  filePath?: string;
  rules?: Rule[];
}

export function auditCode(code: string, options: AuditOptions = {}): LintResult {
  const filePath = options.filePath || "anonymous.tsx";
  const rules = options.rules || allRules;
  const violations: LintViolation[] = [];

  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; loc?: { line: number; column: number } };
    return {
      filePath,
      valid: false,
      violations: [
        {
          ruleId: "anti-ai/syntax-error",
          severity: "error",
          message: `Failed to parse code: ${err.message || "Unknown error"}`,
          line: err.loc?.line ?? 1,
          column: err.loc?.column ?? 0,
          fixHint: "Fix JavaScript/TypeScript syntax errors in the file.",
        },
      ],
    };
  }

  const visitorMap: Record<string, ((path: NodePath<any>) => void)[]> = {};

  for (const rule of rules) {
    const context: RuleContext = {
      filePath,
      report(v) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          ...v,
        });
      },
    };

    const ruleVisitors = rule.create(context);
    for (const [nodeType, handler] of Object.entries(ruleVisitors)) {
      if (!visitorMap[nodeType]) {
        visitorMap[nodeType] = [];
      }
      visitorMap[nodeType].push(handler);
    }
  }

  const combinedVisitor: Record<string, (path: NodePath<any>) => void> = {};

  for (const [nodeType, handlers] of Object.entries(visitorMap)) {
    combinedVisitor[nodeType] = (path: NodePath<any>) => {
      for (const handler of handlers) {
        try {
          handler(path);
        } catch {
        }
      }
    };
  }

  traverse(ast, combinedVisitor);

  return {
    filePath,
    valid: violations.filter((v) => v.severity === "error").length === 0,
    violations,
  };
}
