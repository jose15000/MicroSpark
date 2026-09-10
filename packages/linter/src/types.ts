import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";

export type Severity = "error" | "warning";

export interface LintViolation {
  ruleId: string;
  severity: Severity;
  message: string;
  line: number;
  column: number;
  fixHint: string;
}

export interface LintResult {
  filePath: string;
  valid: boolean;
  violations: LintViolation[];
}

export interface RuleContext {
  report(violation: Omit<LintViolation, "ruleId" | "severity">): void;
  filePath: string;
}

export interface Rule {
  id: string;
  severity: Severity;
  description: string;
  create(context: RuleContext): {
    JSXOpeningElement?(path: NodePath<t.JSXOpeningElement>): void;
    JSXElement?(path: NodePath<t.JSXElement>): void;
    Program?(path: NodePath<t.Program>): void;
    [key: string]: any;
  };
}
