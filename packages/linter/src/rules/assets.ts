import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import { getJSXTagName, getJSXClasses, getJSXChildrenElements } from "../utils/ast-helpers";

// anti-ai/banned-icon-box
// Design Rational: AI creates thousands of identical little boxes `rounded-lg bg-*/10 p-3`
// solely to wrap an SVG icon. This is a generic visual crutch.
export const bannedIconBoxRule: Rule = {
  id: "anti-ai/banned-icon-box",
  severity: "error",
  description: "Detects generic icon wrapper boxes (rounded-lg bg-*/10 p-3 wrapping an SVG icon).",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "div" && tagName !== "span") return;

        const classes = getJSXClasses(path.node.openingElement);

        const hasBoxRounding = classes.some((c) =>
          /rounded-(md|lg|xl|2xl|full)/.test(c)
        );
        const hasLowOpacityBg = classes.some((c) =>
          /bg-[a-z]+-(500|600|400|900|100)\/(10|20|5)/.test(c) ||
          /bg-white\/10|bg-zinc-800|bg-zinc-900/.test(c)
        );
        const hasSmallPadding = classes.some((c) =>
          /^(p-[2-4]|p-2\.5|w-(8|10|12|14)\s+h-(8|10|12|14))/.test(c)
        );

        if (hasBoxRounding && hasLowOpacityBg && hasSmallPadding) {
          const children = getJSXChildrenElements(path.node);
          const containsOnlySvg =
            children.length === 1 &&
            (getJSXTagName(children[0])?.toLowerCase() === "svg" ||
              /icon/i.test(getJSXTagName(children[0]) || ""));

          if (containsOnlySvg) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Generic icon container box detected (`rounded-* bg-*/10 p-*` wrapping an icon). This is an omnipresent AI visual crutch.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Integrate the icon natively into typography, use industrial mono notation (e.g. `[01]`, `//`), or custom technical iconography.",
            });
          }
        }
      },
    };
  },
};

// anti-ai/lazy-transitions
// Design Rational: `transition-all duration-300 ease-in-out` is the universal uninspired CSS transition
// chosen by AI agents. High-end craft demands specific transition properties and authorial easing curves.
export const lazyTransitionsRule: Rule = {
  id: "anti-ai/lazy-transitions",
  severity: "warning",
  description: "Bans generic 'transition-all duration-300 ease-in-out' animations.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node);

        const hasTransitionAll = classes.includes("transition-all");
        const hasDuration300 = classes.includes("duration-300");
        const hasEaseInOut =
          classes.includes("ease-in-out") || classes.includes("ease-out");

        if (hasTransitionAll && hasDuration300 && hasEaseInOut) {
          const loc = path.node.loc;
          context.report({
            message:
              "Lazy transition formula detected (`transition-all duration-300 ease-in-out`). Generic transitions feel sluggish and uncrafted.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Specify exact transitioning properties (`transition-colors`, `transition-transform`) and authorial timing functions (e.g. custom cubic-bezier).",
          });
        }
      },
    };
  },
};

export const assetRules: Rule[] = [
  bannedIconBoxRule,
  lazyTransitionsRule,
];
