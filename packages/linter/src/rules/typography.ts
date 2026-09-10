import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import { getJSXTagName, getJSXClasses } from "../utils/ast-helpers";

export const monumentalTypographyRule: Rule = {
  id: "anti-ai/monumental-typography",
  severity: "warning",
  description: "Enforces monumental, expressive typographic scale on primary H1 elements.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "h1") return;

        const classes = getJSXClasses(path.node.openingElement);
        const hasMonumentalSize = classes.some((c) =>
          /text-(6xl|7xl|8xl|9xl|\[\d+(vw|vh|rem|px)\])/.test(c) ||
          /(sm|md|lg|xl|2xl):text-(6xl|7xl|8xl|9xl|\[\d+(vw|vh|rem|px)\])/.test(c)
        );

        if (!hasMonumentalSize) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              "H1 heading lacks monumental scale. AI templates frequently settle for timid font sizes (text-4xl/text-5xl).",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Elevate headline impact to monumental scale using `text-6xl`, `text-7xl`, `text-8xl`, `text-9xl` or responsive clamp `text-[clamp(...)]`.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/linear-fade-cliche
 * Design Rational: The overused text gradient cliché: bg-clip-text text-transparent bg-gradient-to-* from-white to-zinc-500.
 * It's on virtually every template-generated AI landing page.
 */
export const linearFadeClicheRule: Rule = {
  id: "anti-ai/linear-fade-cliche",
  severity: "error",
  description: "Bans clichéd linear gradient fades on headings (from-white to-zinc-500).",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node);
        const isClippedText =
          classes.includes("bg-clip-text") && classes.includes("text-transparent");

        if (!isClippedText) return;

        const hasWhiteFrom = classes.some((c) => /from-(white|zinc-100|neutral-100|gray-100)/.test(c));
        const hasDarkerTo = classes.some((c) =>
          /to-(zinc-(400|500|600)|neutral-(400|500|600)|gray-(400|500|600)|slate-(400|500|600))/.test(c)
        );

        if (hasWhiteFrom && hasDarkerTo) {
          const loc = path.node.loc;
          context.report({
            message:
              "Banned linear text-fade cliché detected (`bg-clip-text text-transparent from-white to-zinc-500`). This is an exhaustive AI headline hallmark.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Embrace crisp solid typography, stark high-contrast foregrounds, or editorial serif accents rather than generic gradient text fades.",
          });
        }
      },
    };
  },
};

export const typographyRules: Rule[] = [
  monumentalTypographyRule,
  linearFadeClicheRule,
];
