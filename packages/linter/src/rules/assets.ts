import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import {
  getJSXTagName,
  getJSXClasses,
  getJSXChildrenElements,
  getAllJSXDescendants,
  findMapExpressions,
  getTextContent,
} from "../utils/ast-helpers";

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

        const classes = getJSXClasses(path.node.openingElement, path);

        const hasBoxRounding = classes.some((c) =>
          /(^|:)rounded-(md|lg|xl|2xl|full)\b/.test(c)
        );
        const hasLowOpacityBg = classes.some((c) =>
          /(^|:)bg-[a-z]+-(500|600|400|900|100)\/(10|20|5)\b/.test(c) ||
          /(^|:)(bg-white\/10|bg-zinc-800|bg-zinc-900)\b/.test(c)
        );
        const hasSmallPaddingOrSize = classes.some((c) =>
          /(^|:)p-[1-4]\b/.test(c) ||
          /(^|:)p-2\.5\b/.test(c) ||
          /(^|:)w-(8|10|12|14)\b/.test(c)
        );

        if (hasBoxRounding && hasLowOpacityBg && hasSmallPaddingOrSize) {
          const descendants = getAllJSXDescendants(path.node);
          const hasOnlyIconAndNoText =
            descendants.some((d) => {
              const tag = getJSXTagName(d)?.toLowerCase() || "";
              return tag === "svg" || /icon/i.test(tag);
            }) &&
            getTextContent(path.node, path).length === 0;

          if (hasOnlyIconAndNoText && descendants.length <= 3) {
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

// anti-ai/embedded-input-cta
// Design Rational: Single form bar uniting an input directly side-by-side with a button inside the same wrapper in the hero section.
export const embeddedInputCtaRule: Rule = {
  id: "anti-ai/embedded-input-cta",
  severity: "error",
  description: "Detects hero email input with button glued side-by-side in the same pill/bar wrapper.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const classes = getJSXClasses(path.node.openingElement, path);
        const isFlexOrRelativeContainer =
          (classes.includes("flex") || classes.includes("relative") || classes.includes("inline-flex")) &&
          !classes.includes("flex-col");

        if (!isFlexOrRelativeContainer) return;

        const descendants = getAllJSXDescendants(path.node);
        const hasInput = descendants.some((c) => {
          const name = getJSXTagName(c)?.toLowerCase() || "";
          return name === "input" || name.includes("input");
        });
        const hasButton = descendants.some((c) => {
          const name = getJSXTagName(c)?.toLowerCase() || "";
          const btnClasses = getJSXClasses(c.openingElement, path);
          return (
            name === "button" ||
            name.includes("button") ||
            (name === "a" && btnClasses.some((cls) => /(^|:)(bg-|btn)/.test(cls)))
          );
        });

        // Check capsule styling
        const isCapsule =
          classes.some((c) => /(^|:)rounded-(full|xl|lg|2xl)\b/.test(c)) ||
          classes.some((c) => /(^|:)p-[1-2]\b/.test(c)) ||
          classes.some((c) => /(^|:)border\b/.test(c)) ||
          classes.some((c) => /(^|:)bg-/.test(c));

        if (hasInput && hasButton && isCapsule && descendants.length <= 10) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              "Embedded input + CTA button capsule detected in hero section. This glued-input pattern is an overused AI conversion crutch.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Separate input fields with clear architectural boundaries, use CLI terminal inputs (`$ npx microspark init`), or direct interactive action triggers.",
          });
        }
      },
    };
  },
};

// anti-ai/static-pill-tabs
// Design Rational: Line of buttons in `rounded-full` pills functioning as decorative navigation without dynamic state.
export const staticPillTabsRule: Rule = {
  id: "anti-ai/static-pill-tabs",
  severity: "warning",
  description: "Detects static grouped pill buttons ('rounded-full') imitating tab navigation.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const classes = getJSXClasses(path.node.openingElement, path);
        const isGroup =
          classes.includes("flex") || classes.includes("inline-flex");

        if (!isGroup) return;

        // 1. Check mapped pills
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          if (
            mapInfo.returnedElements.some((el) => {
              const elClasses = getJSXClasses(el.openingElement, path);
              const tagName = getJSXTagName(el)?.toLowerCase() || "";
              return (
                (tagName === "button" || tagName === "a" || elClasses.some((c) => /(cursor-pointer|tab)/.test(c))) &&
                elClasses.some((c) => /(^|:)rounded-full\b/.test(c))
              );
            })
          ) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Static pill-tabs group detected (series of `rounded-full` buttons). This mimics AI mockups without genuine reactive tab systems.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Use segmented industrial switchers, underline tabs with precise indicators, or interactive state-bound view switchers.",
            });
            return;
          }
        }

        // 2. Direct or unwrapped children
        let children = getJSXChildrenElements(path.node);
        if (children.length === 1) {
          const inner = getJSXChildrenElements(children[0]);
          if (inner.length >= 3) {
            children = inner;
          }
        }

        if (children.length >= 3 && children.length <= 6) {
          const allPillButtons = children.every((child) => {
            const tagName = getJSXTagName(child)?.toLowerCase() || "";
            const childClasses = getJSXClasses(child.openingElement, path);
            return (
              (tagName === "button" || tagName === "a" || childClasses.some((c) => /(cursor-pointer|tab)/.test(c))) &&
              childClasses.some((c) => /(^|:)rounded-full\b/.test(c))
            );
          });

          if (allPillButtons) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Static pill-tabs group detected (series of `rounded-full` buttons). This mimics AI mockups without genuine reactive tab systems.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Use segmented industrial switchers, underline tabs with precise indicators, or interactive state-bound view switchers.",
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
        const classes = getJSXClasses(path.node, path);

        const hasTransitionAll = classes.some((c) => /(^|:)transition-all\b/.test(c));
        const hasDurationGeneric = classes.some((c) =>
          /(^|:)duration-(150|200|300|500)\b/.test(c)
        );
        const hasEaseInOut = classes.some((c) =>
          /(^|:)ease-(in-out|out)\b/.test(c)
        );

        if (hasTransitionAll && hasDurationGeneric && hasEaseInOut) {
          const loc = path.node.loc;
          context.report({
            message:
              "Lazy transition formula detected (`transition-all duration-200/300 ease-in-out`). Generic transitions feel sluggish and uncrafted.",
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

// anti-ai/minimal-boilerplate-footer
// Design Rational: Footers that are merely a single compressed line with a logo, 3 tiny links and a muted copyright without meaningful structure or design expression.
export const minimalBoilerplateFooterRule: Rule = {
  id: "anti-ai/minimal-boilerplate-footer",
  severity: "warning",
  description: "Detects shallow 1-line boilerplate footers devoid of architectural or editorial density.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase() || "";
        const classes = getJSXClasses(path.node.openingElement, path);

        const isFooterCandidate =
          tagName === "footer" ||
          classes.some((c) => /(^|:)footer\b/i.test(c));

        if (!isFooterCandidate) return;

        const descendants = getAllJSXDescendants(path.node);
        const links = descendants.filter((d) => {
          const tName = getJSXTagName(d)?.toLowerCase() || "";
          return tName === "a" || tName === "link";
        });
        const columns = descendants.filter((d) => {
          const dc = getJSXClasses(d.openingElement, path);
          return dc.some((c) => /(col-span|flex-col)/.test(c));
        });

        // If very few elements, <= 3 links and no multi-column structure
        if (descendants.length <= 12 && links.length <= 3 && columns.length <= 2) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              "Minimal boilerplate footer detected (trivial 1-line layout with <= 3 links and low informational density).",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Elevate footer craftsmanship with multi-column architectural site maps, technical system status telemetry, coordinate stamps, or colophon notes.",
          });
        }
      },
    };
  },
};

export const assetRules: Rule[] = [
  bannedIconBoxRule,
  embeddedInputCtaRule,
  staticPillTabsRule,
  lazyTransitionsRule,
  minimalBoilerplateFooterRule,
];

