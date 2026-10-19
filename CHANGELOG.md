# Changelog

All notable changes to `@nftx/vue-ds` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-19

### Added
- **Foundations & Tokens:**
  - 3-tier design token architecture (`_primitives.scss`, `_breakpoints.scss`, `_semantic.scss`) with CSS cascade layers (`@layer ds.tokens, ds.base, ds.components`).
  - Crimson-wine brand palette (`rose-800` light / `rose-700` fill + `rose-300` text dark) with measured WCAG AA/AAA contrast and $\Delta E(\text{OKLab}) \ge 10$ brand-vs-error separation.
  - Automatic system, light, and dark theme switching via `data-theme` attribute and `prefers-color-scheme`.
  - Windows High Contrast / Forced Colors (`@media (forced-colors: active)`) and reduced motion (`@media (prefers-reduced-motion: reduce)`) support.
- **Mixins & Utilities:**
  - `focus-ring` mixin with 2px solid ring, 2px offset, and forced-colors fallback.
  - `visually-hidden` mixin and utility component `DsVisuallyHidden` (with 6-file component split and full browser tests).
  - `target-size` and `target-size-pseudo` mixins for WCAG 2.2 SC 2.5.8 (≥ 24px fine, ≥ 44px coarse).
- **Storybook 10 & Documentation:**
  - Storybook 10 with `@storybook/vue3-vite`, `@storybook/addon-a11y`, `@storybook/addon-themes`, `@storybook/addon-vitest`, and `@storybook/addon-docs`.
  - Foundations MDX documentation pages (`Colors`, `Typography`, `Spacing`, `Accessibility`).
- **Quality Gates & CI:**
  - Contrast and token symmetry validation script (`scripts/contrast-check.ts`).
  - Vitest Browser Mode with Playwright Chromium for real browser DOM testing.
  - Consumer package smoke test (`scripts/smoke-consumer.ts`) verifying zero `@/*` path alias leaks and clean packaging via `npm pack`.
  - Full CI verification pipeline script (`npm run verify`).
