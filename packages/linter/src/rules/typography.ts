import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import { getJSXTagName, getJSXClasses, getTextContent, getAllStringsInNode } from "../utils/ast-helpers";

export const monumentalTypographyRule: Rule = {
  id: "anti-ai/monumental-typography",
  severity: "warning",
  description: "Enforces monumental, expressive typographic scale on primary H1 elements.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "h1") return;

        const classes = getJSXClasses(path.node.openingElement, path);
        const hasMonumentalSize = classes.some((c) =>
          /(^|:)text-(6xl|7xl|8xl|9xl)\b/.test(c) ||
          /(^|:)text-\[clamp\(.+?\)\]/.test(c) ||
          /(^|:)text-\[(\d{2,}|[6-9])(vw|vh|rem|px)\]/.test(c) ||
          /(^|:)(sm|md|lg|xl|2xl):text-(6xl|7xl|8xl|9xl|\[.+?\])/.test(c)
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
        const classes = getJSXClasses(path.node, path);
        const isClippedText =
          classes.some((c) => /(^|:)bg-clip-text/.test(c)) &&
          classes.some((c) => /(^|:)text-transparent/.test(c));

        if (!isClippedText) return;

        const hasWhiteFrom = classes.some((c) =>
          /(^|:)from-(white|zinc-100|neutral-100|gray-100|slate-100|zinc-200|neutral-200|gray-200|slate-200|stone-100)\b/.test(c) ||
          /(^|:)from-\[#(fff|ffffff)\]/i.test(c)
        );

        const hasDarkerTo = classes.some((c) =>
          /(^|:)to-(zinc|neutral|gray|slate|stone)-(300|400|500|600|700)\b/.test(c) ||
          /(^|:)to-\[#(?:[4-9a-fA-F][0-9a-fA-F]){3}\]/i.test(c)
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

/**
 * anti-ai/lazy-copy-metrics
 * Design Rational: Headings using forced AI metric clichés like "99%", "10x", "3 passos", "em minutos" or "in minutes".
 */
export const lazyCopyMetricsRule: Rule = {
  id: "anti-ai/lazy-copy-metrics",
  severity: "error",
  description: "Detects arbitrary AI marketing quantitative anchors in headings ('10x', '99%', 'in minutes', 'em minutos').",
  create(context) {
    const aiMetricPattern =
      /\b(10x|100x|1000x|99(\.\d+)?%|in minutes|em minutos|3 passos|3 steps|zero to hero|built for scale|supercharge your|supercharge|seamlessly|all-in-one)\b/i;

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase() || "";
        if (!["h1", "h2", "h3", "h4"].includes(tagName)) return;

        // Check text content resolved deeply with scope
        const text = getTextContent(path.node, path);
        let match = aiMetricPattern.exec(text);

        // Also check all strings in node (e.g. expressions, templates)
        if (!match) {
          const strings = getAllStringsInNode(path.node, path);
          for (const s of strings) {
            match = aiMetricPattern.exec(s);
            if (match) break;
          }
        }

        if (match) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              `Lazy AI metric or marketing cliché detected in heading: "${match[0]}". This signals generic LLM promotional copywriting.`,
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Use precise technical nomenclature, authentic engineering problem statements, or specific architectural domain language instead of inflated prompt metrics.",
          });
        }
      },
    };
  },
};

export const typographyRules: Rule[] = [
  monumentalTypographyRule,
  linearFadeClicheRule,
  lazyCopyMetricsRule,
];

