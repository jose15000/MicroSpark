import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import type { Rule } from "../types";
import { getJSXTagName, getJSXClasses } from "../utils/ast-helpers";
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
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const classes = getJSXClasses(path.node);
        const hasGradient = classes.some((c) => c.startsWith("bg-gradient-"));

        if (!hasGradient) return;

        const hasPurpleViolet = classes.some((c) =>
          /(from|to|via)-(purple|violet)-\d+/.test(c)
        );
        const hasIndigoPinkCyan = classes.some((c) =>
          /(from|to|via)-(indigo|pink|cyan|fuchsia)-\d+/.test(c)
        );

        if (hasPurpleViolet && hasIndigoPinkCyan) {
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
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "div" && tagName !== "span") return;

        const classes = getJSXClasses(path.node);
        const isAbsolute = classes.includes("absolute") || classes.includes("fixed");
        const isRoundedFull = classes.includes("rounded-full");
        const hasExtremeBlur = classes.some((c) =>
          /^(backdrop-)?blur-(2xl|3xl|\[.+\])/.test(c)
        );

        if (isAbsolute && isRoundedFull && hasExtremeBlur) {
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
        const classes = getJSXClasses(path.node);

        const hasDarkSurface = classes.some((c) =>
          /bg-(black|zinc-950|zinc-900|neutral-950|neutral-900|slate-950|gray-950)/.test(c)
        );
        const hasNeonAccents = classes.some((c) =>
          /(border|text|shadow)-(cyan-400|cyan-300|fuchsia-500|fuchsia-400)/.test(c)
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
        const classes = getJSXClasses(path.node);

        const hasDarkBg = classes.some((c) =>
          /bg-(black|zinc-(900|950)|neutral-(900|950)|gray-(900|950)|slate-(900|950))/.test(c)
        );
        const hasHeavyOrColoredShadow = classes.some((c) =>
          /shadow-(xl|2xl|\[.+\])/.test(c) || /shadow-(purple|indigo|cyan|pink|violet)/.test(c)
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
 * anti-ai/sterile-canvas
 * Design Rational: Pure solid dark canvas without texture, noise, grain, or canvas elements
 * feels flat, sterile, and uncrafted.
 */
export const sterileCanvasRule: Rule = {
  id: "anti-ai/sterile-canvas",
  severity: "warning",
  description: "Warns when primary viewports use flat solid black/zinc backgrounds with zero texture.",
  create(context) {
    return {
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
        const tagName = getJSXTagName(path.node)?.toLowerCase();
        if (tagName !== "main" && tagName !== "body" && tagName !== "div") return;

        const classes = getJSXClasses(path.node);
        const isViewport =
          classes.some((c) => /min-h-(screen|\[100vh\])/.test(c)) ||
          classes.includes("h-screen") ||
          classes.includes("w-screen");

        const isSolidDark = classes.some((c) =>
          /^(bg-black|bg-zinc-950|bg-neutral-950|bg-slate-950)$/.test(c)
        );

        const hasTextureOrCanvas =
          classes.some((c) => /noise|texture|grain|grid-pattern|radial/.test(c));

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

export const colorRules: Rule[] = [
  genericPurpleGradientRule,
  lazyBlurBlobRule,
  fakeCyberpunkNeonRule,
  muddyShadowsRule,
  sterileCanvasRule,
];
