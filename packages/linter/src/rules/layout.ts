import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import {
  getJSXTagName,
  getJSXClasses,
  getJSXChildrenElements,
  hasTextContent,
  isMediaElement,
} from "../utils/ast-helpers";
import { hasClassMatching } from "../utils/class-parser";

/**
 * anti-ai/hero-split-cliche
 * Design Rational: AI-generated layouts excessively rely on a 50/50 split hero grid where one column
 * is pure marketing copy and the opposite column is a sterile mockup or image without interaction or overlap.
 */
export const heroSplitClicheRule: Rule = {
  id: "anti-ai/hero-split-cliche",
  severity: "error",
  description: "Detects clichéd 50/50 hero split grids (text column next to sterile media column).",
  create(context) {
    let checkedFirstHero = false;

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        if (checkedFirstHero) return;

        const tagName = getJSXTagName(path.node)?.toLowerCase();
        const classes = getJSXClasses(path.node.openingElement);

        const isHeroCandidate =
          tagName === "header" ||
          tagName === "section" ||
          classes.some((c) => /hero/i.test(c)) ||
          path.node.children.some(
            (c) => t.isJSXElement(c) && getJSXTagName(c)?.toLowerCase() === "h1"
          );

        const hasSplitGrid =
          classes.includes("grid") &&
          (classes.includes("grid-cols-2") ||
            classes.some((c) => /^(md|lg|xl):grid-cols-2$/.test(c))) &&
          (classes.includes("grid-cols-1") ||
            classes.some((c) => /^(max-w|w-full)/.test(c)));

        if (isHeroCandidate && hasSplitGrid) {
          const children = getJSXChildrenElements(path.node);
          if (children.length === 2) {
            const [firstCol, secondCol] = children;
            const firstHasH1 =
              getJSXTagName(firstCol)?.toLowerCase() === "h1" ||
              getJSXChildrenElements(firstCol).some(
                (c) => getJSXTagName(c)?.toLowerCase() === "h1"
              );
            const secondIsMedia =
              isMediaElement(secondCol) ||
              getJSXChildrenElements(secondCol).some((c) => isMediaElement(c));

            if (firstHasH1 && secondIsMedia) {
              checkedFirstHero = true;
              const loc = path.node.openingElement.loc;
              context.report({
                message:
                  "Avoid symmetric 50/50 split hero layouts (text column vs. isolated mockup). Use asymmetric layering, editorial typography, or interactive composition.",
                line: loc?.start.line ?? 1,
                column: loc?.start.column ?? 0,
                fixHint:
                  "Break the 50/50 split. Overlay visual elements with text, use multi-layered typography, or introduce intentional asymmetry.",
              });
            }
          }
        }
      },
    };
  },
};

/**
 * anti-ai/generic-hero-pill
 * Design Rational: AI prompts default to placing a tiny badge/pill button with rounded-full
 * ("Introducing v2.0", "New feature") immediately atop the main H1 heading.
 */
export const genericHeroPillRule: Rule = {
  id: "anti-ai/generic-hero-pill",
  severity: "error",
  description: "Detects generic pill badges ('rounded-full') placed immediately preceding the H1 heading.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const children = getJSXChildrenElements(path.node);

        for (let i = 0; i < children.length - 1; i++) {
          const current = children[i];
          const next = children[i + 1];

          const nextIsH1 =
            getJSXTagName(next)?.toLowerCase() === "h1" ||
            getJSXChildrenElements(next).some((c) => getJSXTagName(c)?.toLowerCase() === "h1");

          if (nextIsH1) {
            const currentClasses = getJSXClasses(current.openingElement);
            const isPill =
              currentClasses.includes("rounded-full") &&
              (hasClassMatching(currentClasses, /^py-[012]/) ||
                hasClassMatching(currentClasses, /^px-[2-4]/) ||
                hasClassMatching(currentClasses, /^text-(xs|sm)/));

            if (isPill) {
              const loc = current.openingElement.loc;
              context.report({
                message:
                  "Generic 'rounded-full' pill badge found immediately preceding the H1 heading. This is a telltale signature of generic AI hero templates.",
                line: loc?.start.line ?? 1,
                column: loc?.start.column ?? 0,
                fixHint:
                  "Remove the generic announcement pill or integrate contextual information directly into typographic anchors or subtle mono meta-tags.",
              });
            }
          }
        }
      },
    };
  },
};

/**
 * anti-ai/lazy-symmetry
 * Design Rational: Identical 3-column structures without variation or hierarchy signal robotic template generation.
 */
export const lazySymmetryRule: Rule = {
  id: "anti-ai/lazy-symmetry",
  severity: "warning",
  description: "Detects containers with 3 direct children that have 100% identical styling classes.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const classes = getJSXClasses(path.node.openingElement);
        const isGridOrFlex =
          classes.includes("grid") ||
          classes.includes("flex") ||
          classes.some((c) => c.includes("grid-cols-3") || c.includes("md:grid-cols-3"));

        if (!isGridOrFlex) return;

        const children = getJSXChildrenElements(path.node);
        if (children.length === 3) {
          const classLists = children.map((child) =>
            [...getJSXClasses(child.openingElement)].sort().join(" ")
          );

          if (
            classLists[0].length > 0 &&
            classLists[0] === classLists[1] &&
            classLists[1] === classLists[2]
          ) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Container has 3 direct children with identical CSS classes (lazy symmetry). Differentiate cards with varying spans, contrast, or focal hierarchy.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Introduce visual weight differences, such as a featured card (col-span-2), altered elevation, or distinct typographic emphasis.",
            });
          }
        }
      },
    };
  },
};

/**
 * anti-ai/repetitive-card-pattern
 * Design Rational: The ubiquitous AI feature section pattern: [Icon Box] -> [H3 Title] -> [Paragraph].
 */
export const repetitiveCardPatternRule: Rule = {
  id: "anti-ai/repetitive-card-pattern",
  severity: "error",
  description: "Detects repetitive brother nodes adhering to the rigid [Icon/Box] -> [H3/H4] -> [P] formula.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const children = getJSXChildrenElements(path.node);
        if (children.length < 3) return;

        let matchingCardCount = 0;

        for (const child of children) {
          const grandChildren = getJSXChildrenElements(child);
          if (grandChildren.length >= 3) {
            const firstTag = getJSXTagName(grandChildren[0])?.toLowerCase() || "";
            const firstClasses = getJSXClasses(grandChildren[0].openingElement);
            const isIconBox =
              firstTag === "svg" ||
              firstClasses.some((c) => /p-[1-4]/.test(c)) ||
              getJSXChildrenElements(grandChildren[0]).some(
                (gc) => getJSXTagName(gc)?.toLowerCase() === "svg"
              );

            const secondTag = getJSXTagName(grandChildren[1])?.toLowerCase() || "";
            const isHeading = secondTag === "h3" || secondTag === "h4" || secondTag === "h2";

            const thirdTag = getJSXTagName(grandChildren[2])?.toLowerCase() || "";
            const isParagraph = thirdTag === "p";

            if (isIconBox && isHeading && isParagraph) {
              matchingCardCount++;
            }
          }
        }

        if (matchingCardCount >= 3) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              `Repetitive card formula detected (${matchingCardCount} sibling cards following [Icon Box] -> [Heading] -> [Paragraph]).`,
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Break formulaic repetition. Use interactive live preview panels, asymmetric technical diagrams, data tables, or editorial pull-quotes.",
          });
        }
      },
    };
  },
};

export const layoutRules: Rule[] = [
  heroSplitClicheRule,
  genericHeroPillRule,
  lazySymmetryRule,
  repetitiveCardPatternRule,
];
