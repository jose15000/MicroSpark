/**
 * Splits a class attribute string into distinct, trimmed class tokens.
 */
export function extractClassTokens(classStr: string): string[] {
  if (!classStr || typeof classStr !== "string") return [];
  return classStr.trim().split(/\s+/).filter(Boolean);
}

/**
 * Checks if a token matches any regex in the list.
 */
export function matchesAnyPattern(token: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(token));
}

/**
 * Checks if any class token in the list matches the regex.
 */
export function hasClassMatching(classes: string[], pattern: RegExp): boolean {
  return classes.some((cls) => pattern.test(cls));
}

/**
 * Retrieves all tokens matching a specific regex pattern.
 */
export function getMatchingClasses(classes: string[], pattern: RegExp): string[] {
  return classes.filter((cls) => pattern.test(cls));
}
