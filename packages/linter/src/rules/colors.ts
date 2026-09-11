import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import { getJSXTagName, getJSXClasses, getJSXInlineStyles, getAllJSXDescendants } from "../utils/ast-helpers";
import { hasClassMatching } from "../utils/class-parser";

/**
 * anti-ai/generic-purple-gradient
 * Design Rational: AI default styling almost invariably leans towards purple/violet + indigo/pink/cyan gradients.
 */
export const genericPurpleGradientRule: Rule = {
  id: "anti-ai/generic-purple-gradient",
  severity: "error",
  description: "Bans generic AI purple/violet + indigo/pink/cyan gradient combinations.",
  create(context) {
    // Match standard or arbitrary color stops for purple/violet/magenta family
    const purpleVioletRegex = /(from|to|via)-(purple|violet|fuchsia)-(\d+|\[.+?\])|(from|to|via)-\[#([0-9a-fA-F]{3,8})\]|(from|to|via)-\[rgba?\([^)]+\)\]/i;
    // Match standard or arbitrary color stops for indigo/pink/cyan/fuchsia/rose family
    const companionAccentRegex = /(from|to|via)-(indigo|pink|cyan|fuchsia|rose)-(\d+|\[.+?\])|(from|to|via)-\[#([0-9a-fA-F]{3,8})\]|(from|to|via)-\[rgba?\([^)]+\)\]/i;

    function isPurpleHue(hex: string): boolean {
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      // Purple/violet has high red and blue relative to green
      return r > 100 && b > 120 && g < Math.min(r, b) * 0.9;
    }

    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);
        const hasGradient = classes.some((c) => c.startsWith("bg-gradient-") || /(^|:)bg-gradient-/.test(c));

        if (!hasGradient) return;

        let hasPurple = classes.some((c) => /(from|to|via)-(purple|violet|fuchsia)-/.test(c));
        let hasCompanion = classes.some((c) => /(from|to|via)-(indigo|pink|cyan|fuchsia|rose)-/.test(c));

        for (const c of classes) {
          const hexMatch = /(from|to|via)-\[#([0-9a-fA-F]{3,8})\]/i.exec(c);
          if (hexMatch) {
            if (isPurpleHue(hexMatch[2])) {
              hasPurple = true;
            } else {
              hasCompanion = true;
            }
          }
        }

        if (hasPurple && (hasCompanion || classes.filter((c) => /(from|to|via)-/.test(c)).length >= 2)) {
          const loc = path.node.loc;
          context.report({
            message:
              "Banned generic purple/indigo/pink AI gradient detected. This palette is the most saturated visual cliche of AI-generated landing pages.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Use authentic mono accents, warm industrial tones (amber, zinc, rust), or high-contrast chromatic duotones.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/lazy-blur-blob
 * Design Rational: Absolute positioned rounded-full div blobs with extreme blur values
 * (blur-2xl, blur-3xl) are lazy stand-ins for real ambient lighting or WebGL shaders.
 */
export const lazyBlurBlobRule: Rule = {
  id: "anti-ai/lazy-blur-blob",
  severity: "error",
  description: "Detects absolute/fixed rounded-full blobs with extreme blur filters.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);
        const inlineStyles = getJSXInlineStyles(path.node);

        const isAbsolute = classes.includes("absolute") || classes.includes("fixed");
        const isRoundedFull = classes.includes("rounded-full") || inlineStyles["borderRadius"] === "9999px" || inlineStyles["borderRadius"] === "50%";

        const hasExtremeBlurClass = classes.some((c) =>
          /(^|:)(backdrop-)?blur-(2xl|3xl|\[\d+(px|rem)\])/.test(c) ||
          /(^|:)filter\s+blur-/.test(c)
        );

        let hasInlineExtremeBlur = false;
        if (typeof inlineStyles["filter"] === "string" && /blur\(\s*(\d{2,}|[4-9]\d*)px\)/.test(inlineStyles["filter"])) {
          hasInlineExtremeBlur = true;
        }

        if (isAbsolute && isRoundedFull && (hasExtremeBlurClass || hasInlineExtremeBlur)) {
          const loc = path.node.loc;
          context.report({
            message:
              "Lazy blur-blob background detected (absolute + rounded-full + blur-3xl). This is an ubiquitous artificial lighting crutch in AI templates.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Replace sterile blur-blobs with WebGL canvas shaders, SVG noise grain, or structured architectural grid illumination.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/fake-cyberpunk-neon
 * Design Rational: Pairing dark backgrounds with raw neon cyan/fuchsia borders or shadows
 * produces cheap synthetic contrast rather than physically-grounded emissive lighting.
 */
export const fakeCyberpunkNeonRule: Rule = {
  id: "anti-ai/fake-cyberpunk-neon",
  severity: "warning",
  description: "Detects dark background elements paired with harsh neon cyan/fuchsia accents.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);

        const hasDarkSurface = classes.some((c) =>
          /(^|:)bg-(black|zinc-950|zinc-900|neutral-950|neutral-900|slate-950|gray-950)/.test(c)
        );
        const hasNeonAccents = classes.some((c) =>
          /(^|:)(border|text|shadow)-(cyan-400|cyan-300|emerald-400|fuchsia-500|fuchsia-400)/.test(c) ||
          /(^|:)shadow-\[0_0_/.test(c)
        );

        if (hasDarkSurface && hasNeonAccents) {
          const loc = path.node.loc;
          context.report({
            message:
              "Fake cyberpunk neon palette detected on dark surface. Raw saturated neons look synthetic without realistic light falloff or diffusion.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Desaturate neon borders or apply low-opacity alpha layers (e.g. border-cyan-500/20) with physical falloff.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/muddy-shadows
 * Design Rational: Huge drop shadows (shadow-xl, shadow-2xl) or colored shadows on dark backgrounds
 * create muddy, unphysical smudges. Dark mode requires crisp 1px borders with low opacity.
 */
export const muddyShadowsRule: Rule = {
  id: "anti-ai/muddy-shadows",
  severity: "warning",
  description: "Prohibits heavy shadows (shadow-xl, shadow-2xl) or colored shadows on dark backgrounds.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);

        const hasDarkBg = classes.some((c) =>
          /(^|:)bg-(black|zinc-(900|950)|neutral-(900|950)|gray-(900|950)|slate-(900|950))/.test(c)
        );
        const hasHeavyOrColoredShadow = classes.some((c) =>
          /(^|:)shadow-(xl|2xl|\[.+\])/.test(c) || /(^|:)shadow-(purple|indigo|cyan|pink|violet)/.test(c)
        );

        if (hasDarkBg && hasHeavyOrColoredShadow) {
          const loc = path.node.loc;
          context.report({
            message:
              "Muddy drop shadows detected on dark background. Diffuse drop shadows do not produce realistic physical depth on dark surfaces.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Replace deep shadows with a 1px translucent border (`border border-white/10`) and subtle top edge highlights.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/muddy-glassmorphism
 * Design Rational: Indiscriminate use of `bg-white/5` or `bg-zinc-900/40` with `backdrop-blur-md` and `border-white/10` across containers.
 */
export const muddyGlassmorphismRule: Rule = {
  id: "anti-ai/muddy-glassmorphism",
  severity: "error",
  description: "Detects overuse of generic washed-out glassmorphism (backdrop-blur-md + bg-white/5 + border-white/10).",
  create(context) {
    let glassmorphismCount = 0;
    const reportedNodes = new Set<t.JSXOpeningElement>();

    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);

        const hasBackdropBlur = classes.some((c) => /(^|:)backdrop-blur-(sm|md|lg|xl|2xl|\[.+\])/.test(c));
        const hasTranslucentBg = classes.some((c) =>
          /(^|:)bg-(white|zinc-900|zinc-800|zinc-950|black|neutral-900|slate-900)\/(5|10|15|20|30|40|50)/.test(c) ||
          /(^|:)bg-\[rgba\([^)]+\)\]/.test(c)
        );
        const hasFaintBorder = classes.some((c) =>
          /(^|:)border-(white|zinc-700|zinc-800|neutral-700|slate-700)\/(5|10|15|20)/.test(c) ||
          classes.includes("border-white/10") ||
          /(^|:)border-white\/10/.test(c)
        );

        if (hasBackdropBlur && (hasTranslucentBg || hasFaintBorder)) {
          glassmorphismCount++;
          if (glassmorphismCount >= 2 && !reportedNodes.has(path.node)) {
            reportedNodes.add(path.node);
            const loc = path.node.loc;
            context.report({
              message:
                "Repetitive, muddy glassmorphism detected (`backdrop-blur-md` + translucent washed background). This creates muddy, low-contrast visual sludge.",
              line: loc?.start.line ?? 1,
              column: loc?.start.column ?? 0,
              fixHint:
                "Use high-contrast opaque materials with crisp 1px borders, subtle metallic gradients, or physical light-refracting shaders instead of repetitive backdrop blurs.",
            });
          }
        }
      },
    };
  },
};

/**
 * anti-ai/sterile-canvas
 * Design Rational: Pure solid dark canvas without texture, noise, grain, or canvas elements feels flat, sterile, and uncrafted.
 */
export const sterileCanvasRule: Rule = {
  id: "anti-ai/sterile-canvas",
  severity: "warning",
  description: "Warns when primary viewports use flat solid black/zinc backgrounds with zero texture.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "main" && tagName !== "body" && tagName !== "div" && tagName !== "section") return;

        const classes = getJSXClasses(path.node, path);
        const isViewport =
          classes.some((c) => /(^|:)min-h-(screen|\[100vh\])/.test(c)) ||
          classes.includes("h-screen") ||
          classes.includes("w-screen");

        const isSolidDark = classes.some((c) =>
          /^(bg-black|bg-zinc-950|bg-neutral-950|bg-slate-950)$/.test(c) ||
          /(^|:)(bg-black|bg-zinc-950|bg-neutral-950|bg-slate-950)\b/.test(c)
        );

        let hasTextureOrCanvas =
          classes.some((c) => /noise|texture|grain|grid-pattern|radial|shader|feTurbulence/i.test(c));

        if (!hasTextureOrCanvas && path.parentPath && path.parentPath.isJSXElement()) {
          const descendants = getAllJSXDescendants(path.parentPath.node);
          hasTextureOrCanvas = descendants.some((d) => {
            const dClasses = getJSXClasses(d.openingElement, path);
            const dTag = getJSXTagName(d)?.toLowerCase() || "";
            return (
              dTag === "canvas" ||
              dTag === "svg" ||
              dClasses.some((c) => /noise|texture|grain|grid-pattern|radial|shader|bg-noise/i.test(c))
            );
          });
        }

        if (isViewport && isSolidDark && !hasTextureOrCanvas) {
          const loc = path.node.loc;
          context.report({
            message:
              "Sterile solid dark canvas detected without surface texture, grain, or architectural noise.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Add an ambient SVG noise layer, subtle dot grid, or interactive WebGL canvas backdrop.",
          });
        }
      },
    };
  },
};

/**
 * anti-ai/gradient-divider-line
 * Design Rational: The clichéd 1px divider that fades at the edges (`bg-gradient-to-r from-transparent via-zinc-700 to-transparent h-[1px]`).
 */
export const gradientDividerLineRule: Rule = {
  id: "anti-ai/gradient-divider-line",
  severity: "error",
  description: "Detects clichéd 1px horizontal section dividers fading on edges with gradient-to-r.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node, path);

        const isThinLine =
          classes.includes("h-[1px]") ||
          classes.includes("h-px") ||
          classes.some((c) => /(^|:)h-\[1px\]/.test(c) || /(^|:)h-px/.test(c) || /(^|:)border-t(\s|$)/.test(c));

        const isFadingGradient =
          (classes.includes("bg-gradient-to-r") || classes.some((c) => /(^|:)bg-gradient-to-r/.test(c))) &&
          classes.some((c) => /from-transparent/.test(c)) &&
          (classes.some((c) => /to-transparent/.test(c)) || classes.some((c) => /via-/.test(c)));

        if (isThinLine && isFadingGradient) {
          const loc = path.node.loc;
          context.report({
            message:
              "Clichéd fading gradient line detected (`bg-gradient-to-r from-transparent via-... to-transparent h-[1px]`). This is an omnipresent AI template divider.",
            line: loc?.start.line ?? 1,
            column: loc?.start.column ?? 0,
            fixHint:
              "Use architectural structural grid borders (`border-t border-white/10`), corner crosses (`+`), or technical coordinate notches instead.",
          });
        }
      },
    };
  },
};

export const colorRules: Rule[] = [
  genericPurpleGradientRule,
  lazyBlurBlobRule,
  fakeCyberpunkNeonRule,
  muddyShadowsRule,
  muddyGlassmorphismRule,
  sterileCanvasRule,
  gradientDividerLineRule,
];

