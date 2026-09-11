import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import {
  getJSXTagName,
  getJSXClasses,
  getJSXChildrenElements,
  hasTextContent,
  isMediaElement,
  getTextContent,
  getAllJSXDescendants,
  findMapExpressions,
  getAllStringsInNode,
} from "../utils/ast-helpers";
import { hasClassMatching } from "../utils/class-parser";

/**
 * anti-ai/banned-centered-hero
 * Design Rational: AI prompts default to fully centered header/section containing badge, H1, subtext, and CTA in a single centered column.
 */
export const bannedCenteredHeroRule: Rule = {
  id: "anti-ai/banned-centered-hero",
  severity: "error",
  description: "Detects clichéd 100% centered hero sections without visual counterweight or lateral asymmetry.",
  create(context) {
    const reportedHeros = new Set<t.JSXElement>();

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        const classes = getJSXClasses(path.node.openingElement, path);

        const isHeroCandidate =
          tagName === "header" ||
          tagName === "section" ||
          classes.some((c) => /hero/i.test(c)) ||
          path.node.children.some(
            (c) => t.isJSXElement(c) && getJSXTagName(c)?.toLowerCase() === "h1"
          );

        if (!isHeroCandidate) return;

        const descendants = getAllJSXDescendants(path.node);
        const h1Element = descendants.find((c) => getJSXTagName(c)?.toLowerCase() === "h1");
        if (!h1Element) return;

        // Check if H1 or its immediate container chain is text-center
        const h1Classes = getJSXClasses(h1Element.openingElement, path);
        const isH1Centered = h1Classes.includes("text-center") || classes.includes("text-center");

        // Check if container or inner wrapper or H1 is centered
        const isCenteredContainer =
          classes.includes("text-center") ||
          isH1Centered ||
          descendants.some((d) => {
            const dc = getJSXClasses(d.openingElement, path);
            return dc.includes("text-center") || (dc.includes("mx-auto") && dc.includes("text-center"));
          });

        if (isCenteredContainer) {
          // Verify if there is lateral counterweight or multi-column grid/flex row
          const hasMultiCols =
            classes.some((c) => /(^|:)(grid-cols-[2-9]|flex-row)\b/.test(c)) ||
            descendants.some((d) => {
              const dc = getJSXClasses(d.openingElement, path);
              return dc.some((c) => /(^|:)(grid-cols-[2-9]|flex-row)\b/.test(c));
            });

          // Check if there are sidebars or split elements
          if (!hasMultiCols && !reportedHeros.has(path.node)) {
            reportedHeros.add(path.node);
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Clichéd 100% centered hero detected (`text-center` with stacked badge, H1, subtitle, and CTA in single column). Introduce lateral asymmetry, structural grid anchors, or visual counterweights.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Break the monotonous centered column. Use left-aligned monumental typography with technical sidebars, asymmetric WebGL stages, or split grid counters.",
            });
          }
        }
      },
    };
  },
};

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
        const classes = getJSXClasses(path.node.openingElement, path);

        const isHeroCandidate =
          tagName === "header" ||
          tagName === "section" ||
          classes.some((c) => /hero/i.test(c)) ||
          getAllJSXDescendants(path.node).some((c) => getJSXTagName(c)?.toLowerCase() === "h1");

        const hasSplitGrid =
          classes.includes("grid") &&
          classes.some((c) => /(^|:)grid-cols-2\b/.test(c));

        if (isHeroCandidate && hasSplitGrid) {
          const children = getJSXChildrenElements(path.node);
          if (children.length === 2) {
            const [firstCol, secondCol] = children;
            const firstHasH1 =
              getJSXTagName(firstCol)?.toLowerCase() === "h1" ||
              getAllJSXDescendants(firstCol).some((c) => getJSXTagName(c)?.toLowerCase() === "h1");

            const secondIsMedia =
              isMediaElement(secondCol) ||
              getAllJSXDescendants(secondCol).some((c) => isMediaElement(c));

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
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "h1") return;

        // Check previous sibling in parent
        const parent = path.parent;
        if (t.isJSXElement(parent)) {
          const siblings = getJSXChildrenElements(parent);
          const h1Index = siblings.indexOf(path.node);
          if (h1Index > 0) {
            const prevSibling = siblings[h1Index - 1];
            const prevClasses = getJSXClasses(prevSibling.openingElement, path);
            const isPill =
              prevClasses.includes("rounded-full") &&
              (hasClassMatching(prevClasses, /(^|:)py-[012]/) ||
                hasClassMatching(prevClasses, /(^|:)px-[2-4]/) ||
                hasClassMatching(prevClasses, /(^|:)text-(xs|sm)/));

            if (isPill) {
              const loc = prevSibling.openingElement.loc;
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
        const classes = getJSXClasses(path.node.openingElement, path);
        const isGridOrFlex =
          classes.includes("grid") ||
          classes.includes("flex") ||
          classes.some((c) => /(^|:)(grid-cols-3|flex-row)\b/.test(c));

        if (!isGridOrFlex) return;

        // Check for .map() inside this grid/flex container
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          if (mapInfo.itemCount === 3 && mapInfo.returnedElements.length > 0) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Container renders 3 mapped items with uniform card hierarchy (lazy symmetry). Differentiate cards with varying spans, contrast, or focal hierarchy.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Introduce visual weight differences, such as a featured card (col-span-2), altered elevation, or distinct typographic emphasis.",
            });
            return;
          }
        }

        // Direct children
        let children = getJSXChildrenElements(path.node);
        // If single wrapper child, unwrap it
        if (children.length === 1) {
          const innerChildren = getJSXChildrenElements(children[0]);
          if (innerChildren.length === 3) {
            children = innerChildren;
          }
        }

        if (children.length === 3) {
          const classLists = children.map((child) =>
            [...getJSXClasses(child.openingElement, path)].sort().join(" ")
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
 * anti-ai/strict-no-uniform-steps
 * Design Rational: 3 horizontal boxes representing "Step 1, 2, 3" or "How it works" with identical dimensions and no kinematic connection lines.
 */
export const strictNoUniformStepsRule: Rule = {
  id: "anti-ai/strict-no-uniform-steps",
  severity: "error",
  description: "Detects uniform, repetitive 'Step 1/2/3' or 'How it works' sequences lacking scale variation or interactive narrative flow.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const stepPattern = /^(step\s*[0-9]|passo\s*[0-9]|0[1-9]\b)/i;
        const stepGeneralPattern = /\b(step\s+[0-9]|passo\s+[0-9]|etapa\s+[0-9])\b/i;

        // Check map expressions first
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          let hasStepData = false;
          if (mapInfo.arrayLiteral) {
            const strings = getAllStringsInNode(mapInfo.arrayLiteral, path);
            const stepMatches = strings.filter((s) => stepPattern.test(s) || stepGeneralPattern.test(s));
            if (stepMatches.length >= 2 || /step|passo/i.test(mapInfo.arrayName || "")) {
              hasStepData = true;
            }
          } else if (/step|passo/i.test(mapInfo.arrayName || "")) {
            hasStepData = true;
          }

          if (hasStepData && (mapInfo.itemCount === undefined || (mapInfo.itemCount >= 3 && mapInfo.itemCount <= 5))) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Uniform 'Step 1, 2, 3' sequence detected without scale variation, editorial typography, or kinematic connection line.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Differentiate steps with progressive disclosure, timeline connectors, varying card spans, or an interactive scroll-triggered walkthrough.",
            });
            return;
          }
        }

        // Check direct or descendant children
        let children = getJSXChildrenElements(path.node);
        if (children.length === 1) {
          const inner = getJSXChildrenElements(children[0]);
          if (inner.length >= 3 && inner.length <= 5) {
            children = inner;
          }
        }

        if (children.length < 3 || children.length > 5) return;

        let sequentialStepCount = 0;
        for (const child of children) {
          const text = getTextContent(child, path).trim();
          if (stepPattern.test(text) || stepGeneralPattern.test(text)) {
            sequentialStepCount++;
          }
        }

        if (sequentialStepCount >= 3) {
          const firstClasses = [...getJSXClasses(children[0].openingElement, path)].sort().join(" ");
          const secondClasses = [...getJSXClasses(children[1].openingElement, path)].sort().join(" ");
          const thirdClasses = [...getJSXClasses(children[2].openingElement, path)].sort().join(" ");

          if (firstClasses === secondClasses && secondClasses === thirdClasses) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Uniform 'Step 1, 2, 3' sequence detected without scale variation, editorial typography, or kinematic connection line.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Differentiate steps with progressive disclosure, timeline connectors, varying card spans, or an interactive scroll-triggered walkthrough.",
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
    function isCardPattern(element: t.JSXElement, path: NodePath<any>): boolean {
      const descendants = getAllJSXDescendants(element);
      const hasIcon = descendants.some((d) => {
        const tag = getJSXTagName(d)?.toLowerCase() || "";
        return tag === "svg" || /icon/i.test(tag);
      });
      const hasHeading = descendants.some((d) => {
        const tag = getJSXTagName(d)?.toLowerCase() || "";
        return ["h2", "h3", "h4"].includes(tag);
      });
      const hasParagraph = descendants.some((d) => {
        const tag = getJSXTagName(d)?.toLowerCase() || "";
        return tag === "p";
      });
      return hasIcon && hasHeading && hasParagraph;
    }

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        // 1. Check for map rendering card pattern
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          if (mapInfo.returnedElements.some((el) => isCardPattern(el, path))) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Repetitive card formula detected in mapped items following rigid [Icon Box] -> [Heading] -> [Paragraph].",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Break formulaic repetition. Use interactive live preview panels, asymmetric technical diagrams, data tables, or editorial pull-quotes.",
            });
            return;
          }
        }

        // 2. Sibling elements
        let children = getJSXChildrenElements(path.node);
        if (children.length === 1) {
          const inner = getJSXChildrenElements(children[0]);
          if (inner.length >= 3) {
            children = inner;
          }
        }

        if (children.length < 3) return;

        let matchingCardCount = 0;
        for (const child of children) {
          if (isCardPattern(child, path)) {
            matchingCardCount++;
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

/**
 * anti-ai/banned-three-tier-pricing
 * Design Rational: The stereotyped AI pricing table: 3 columns with currency strings ($/month, R$/mês) where the middle one has 'Most Popular' / 'Best Value' badge.
 */
export const bannedThreeTierPricingRule: Rule = {
  id: "anti-ai/banned-three-tier-pricing",
  severity: "error",
  description: "Detects formulaic 3-tier pricing tables with an elevated 'Most Popular' middle card.",
  create(context) {
    const currencyRegex = /(\$|€|£|R\$|\/mo|\/month|\/ano|\/mês|\/year|per month|por mês)/i;
    const tierKeywords = /\b(free|pro|enterprise|starter|hobby|premium|basic|pricing|plan|tiers)\b/i;
    const popularBadgeRegex = /\b(most popular|best value|popular|mais popular|destaque|featured)\b/i;

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        // 1. Check mapped pricing array
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          let isPricingArray = false;
          if (mapInfo.arrayLiteral) {
            const strings = getAllStringsInNode(mapInfo.arrayLiteral, path);
            const currencyMatches = strings.filter((s) => currencyRegex.test(s));
            const tierMatches = strings.filter((s) => tierKeywords.test(s));
            const hasPopular = strings.some((s) => popularBadgeRegex.test(s));

            if ((currencyMatches.length >= 2 || tierMatches.length >= 2) && (mapInfo.itemCount === 3 || hasPopular)) {
              isPricingArray = true;
            }
          } else if (mapInfo.arrayName && /plan|tier|pricing/i.test(mapInfo.arrayName)) {
            isPricingArray = true;
          }

          if (isPricingArray) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Clichéd 3-tier pricing grid detected. This formula (Free / Pro 'Most Popular' / Enterprise) is an exhaustive AI template pattern.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Reimagine pricing with interactive sliders, modular architectural calculators, tier comparison matrices, or editorial brutalist layouts.",
            });
            return;
          }
        }

        // 2. Direct children or unwrapped children
        let children = getJSXChildrenElements(path.node);
        if (children.length === 1) {
          const inner = getJSXChildrenElements(children[0]);
          if (inner.length === 3) {
            children = inner;
          }
        }

        if (children.length !== 3) return;

        let pricingCardsCount = 0;
        let hasElevationOrPopularBadge = false;

        for (const child of children) {
          const text = getTextContent(child, path);
          const childClasses = getJSXClasses(child.openingElement, path);
          const hasCurrency = currencyRegex.test(text);
          const hasTier = tierKeywords.test(text);

          if (hasCurrency || hasTier) {
            pricingCardsCount++;
          }

          if (
            popularBadgeRegex.test(text) ||
            childClasses.some((c) => /(scale-105|-translate-y|z-10|ring-2|border-primary)/.test(c))
          ) {
            hasElevationOrPopularBadge = true;
          }
        }

        if (pricingCardsCount >= 2 && (pricingCardsCount === 3 || hasElevationOrPopularBadge)) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              "Clichéd 3-tier pricing grid detected. This formula (Free / Pro 'Most Popular' / Enterprise) is an exhaustive AI template pattern.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Reimagine pricing with interactive sliders, modular architectural calculators, tier comparison matrices, or editorial brutalist layouts.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/banned-card-testimonials
 * Design Rational: 3 isolated testimonial cards with 5 star rating icons, quotation marks, and a circular avatar.
 */
export const bannedCardTestimonialsRule: Rule = {
  id: "anti-ai/banned-card-testimonials",
  severity: "error",
  description: "Detects formulaic 3-card testimonial grids with 5-star rating icons and circular avatars.",
  create(context) {
    function isTestimonialCard(element: t.JSXElement, path: NodePath<any>): boolean {
      const descendants = getAllJSXDescendants(element);
      const hasStars = descendants.some((d) => {
        const name = getJSXTagName(d)?.toLowerCase() || "";
        return name === "star" || name.includes("star") || getTextContent(d, path).includes("★");
      });
      const hasAvatar = descendants.some((d) => {
        const classes = getJSXClasses(d.openingElement, path);
        const name = getJSXTagName(d)?.toLowerCase() || "";
        return (
          classes.includes("rounded-full") &&
          (name === "img" || name === "image" || classes.some((c) => /w-(8|10|12|14)/.test(c)))
        );
      });
      const hasQuote = descendants.some((d) => {
        const text = getTextContent(d, path);
        return /[""“”]/.test(text) || /quote|testimonial/i.test(getJSXTagName(d) || "");
      });

      return (hasStars || hasQuote) && (hasAvatar || hasTextContent(element));
    }

    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        // 1. Check map expressions
        const mapExprs = findMapExpressions(path.node, path);
        for (const mapInfo of mapExprs) {
          let isTestimonialMap = false;
          if (mapInfo.arrayLiteral) {
            const strings = getAllStringsInNode(mapInfo.arrayLiteral, path);
            const hasStarOrQuote = strings.some((s) => s.includes("★") || /rating|stars|quote|testimonial/i.test(s));
            if (hasStarOrQuote || /testimonial|review/i.test(mapInfo.arrayName || "")) {
              isTestimonialMap = true;
            }
          } else if (mapInfo.arrayName && /testimonial|review/i.test(mapInfo.arrayName)) {
            isTestimonialMap = true;
          }

          if (mapInfo.returnedElements.some((el) => isTestimonialCard(el, path))) {
            isTestimonialMap = true;
          }

          if (isTestimonialMap) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Formulaic 3-card testimonial grid detected (5-star ratings, quotes, circular avatars). This is a hallmark of prefabricated AI landing pages.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Replace generic 5-star cards with verifiable customer telemetry, editorial case-study quotes, real social embeds, or video/audio clips.",
            });
            return;
          }
        }

        // 2. Direct or unwrapped sibling children
        let children = getJSXChildrenElements(path.node);
        if (children.length === 1) {
          const inner = getJSXChildrenElements(children[0]);
          if (inner.length >= 3) {
            children = inner;
          }
        }

        if (children.length < 3) return;

        let testimonialCount = 0;
        for (const child of children) {
          if (isTestimonialCard(child, path)) {
            testimonialCount++;
          }
        }

        if (testimonialCount >= 3) {
          const loc = path.node.openingElement.loc;
          context.report({
            message:
              "Formulaic 3-card testimonial grid detected (5-star ratings, quotes, circular avatars). This is a hallmark of prefabricated AI landing pages.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Replace generic 5-star cards with verifiable customer telemetry, editorial case-study quotes, real social embeds, or video/audio clips.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/default-accordion-stack
 * Design Rational: Static, detached vertical stack of 4-5 accordion items (FAQ) pasted from UI libraries without editorial integration.
 */
export const defaultAccordionStackRule: Rule = {
  id: "anti-ai/default-accordion-stack",
  severity: "warning",
  description: "Detects generic, detached FAQ accordion stacks dumped into the center of the page.",
  create(context) {
    return {
      JSXElement(path: NodePath<t.JSXElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase() || "";
        const classes = getJSXClasses(path.node.openingElement, path);

        const isAccordion =
          tagName.includes("accordion") ||
          classes.some((c) => /accordion|faq/i.test(c));

        if (isAccordion) {
          const children = getJSXChildrenElements(path.node);
          const mapExprs = findMapExpressions(path.node, path);
          if (children.length >= 3 || mapExprs.length > 0) {
            const loc = path.node.openingElement.loc;
            context.report({
              message:
                "Generic isolated accordion stack detected. Default FAQ accordions are frequently tacked onto AI pages without editorial craft.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Integrate knowledge base questions into contextual feature cards, two-column split docs layouts, or interactive conversational search.",
            });
          }
        }
      },
    };
  },
};

export const layoutRules: Rule[] = [
  bannedCenteredHeroRule,
  heroSplitClicheRule,
  genericHeroPillRule,
  lazySymmetryRule,
  strictNoUniformStepsRule,
  repetitiveCardPatternRule,
  bannedThreeTierPricingRule,
  bannedCardTestimonialsRule,
  defaultAccordionStackRule,
];

