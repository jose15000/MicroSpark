import type { Rule } from "../types";
import { layoutRules } from "./layout";
import { colorRules } from "./colors";
import { typographyRules } from "./typography";
import { assetRules } from "./assets";

export const allRules: Rule[] = [
  ...layoutRules,
  ...colorRules,
  ...typographyRules,
  ...assetRules,
];

export { layoutRules, colorRules, typographyRules, assetRules };
