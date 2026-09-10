import * as fs from "fs";
import { auditCode, type AuditOptions } from "./audit";
import type { LintResult, LintViolation, Rule, RuleContext, Severity } from "./types";
import { allRules, layoutRules, colorRules, typographyRules, assetRules } from "./rules";

export { auditCode };

export async function auditFile(
  filePath: string,
  options: Omit<AuditOptions, "filePath"> = {}
): Promise<LintResult> {
  const code = await fs.promises.readFile(filePath, "utf-8");
  return auditCode(code, { ...options, filePath });
}

export function auditFileSync(
  filePath: string,
  options: Omit<AuditOptions, "filePath"> = {}
): LintResult {
  const code = fs.readFileSync(filePath, "utf-8");
  return auditCode(code, { ...options, filePath });
}

export { allRules, layoutRules, colorRules, typographyRules, assetRules };
export type { LintResult, LintViolation, Rule, RuleContext, Severity, AuditOptions };
