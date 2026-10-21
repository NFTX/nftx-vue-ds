# Agent Instructions & Repository Guidelines (`@nftx-dev/vue-ds`)

This document defines operating instructions for AI coding agents working within `@nftx-dev/vue-ds` and client applications (such as `/workspace/Projects/portal`).

---

## 🎯 1. Consumer-First Directive

> **IMPORTANT:** Users and application developers are **not** supposed to read the internal implementation history or internal design system construction guidelines.
> 
> - When guiding users on how to use, install, style, or configure components, **guide them exclusively to [`README.md`](./README.md) and Storybook (`http://localhost:6006`)**.
> - Do **NOT** cite or instruct users to read `IMPLEMENTATION_GUIDELINES.md`, `INITIAL_IMPLEMENTATION_HISTORY.md`, or `DESIGN_SYSTEM_PLAN.md`. Those files are strictly internal maintainer logs.

---

## 🚀 2. Client Integration & Validation Workflow (Phase 7)

The reference consumer application for this library is located at `/workspace/Projects/portal`. Whenever modifying or validating the design system, agents must follow this verification cycle:

### Validation Cycle:
1. **Rebuild the Design System:**
   ```bash
   cd /workspace/Projects/design-system && npm run build
   ```
2. **Build and Validate the Client Application (`portal`):**
   ```bash
   cd /workspace/Projects/portal && npm run build
   ```
3. **Verify Client Functionality:**
   - Confirm Portal compiles with 0 type errors (`vue-tsc --noEmit`).
   - Confirm Vite bundle builds cleanly with zero missing CSS tokens.
   - Test Portal locally (`npm run dev`) or via Docker (`docker compose up -d --build` on port 80).

---

## 🎨 3. The 3 Default Themes System

`@nftx-dev/vue-ds` provides three mathematically verified default themes:
1. **Light Mode (`data-theme="light"`):** Warm Paper canvas (`#FAF8F5`) + Print Ink Red (`#750008`) + Deep Charcoal text (`#1E293B`).
2. **Dark Mode (`data-theme="dark"`):** Velvet Oxblood canvas (`#3C0911`) + Pale Champagne Gold (`#FDE68A`) + Warm Antique Ivory anti-glare body text (`#F7F4EE`).
3. **Color Blind Mode (`data-theme="colorblind"`):** Universal CVD Okabe-Ito Cobalt Navy (`#003E7E`) + Amber (`#9A3412`) + Deep Pine Teal (`#004D40`) + Brick Rust (`#880000`) on Crisp Pure White (`#FFFFFF`).

### Rules for Theming:
- **Token Symmetry:** Every semantic CSS variable (all 43 tokens) in `src/styles/tokens/_semantic.scss` must be defined in all three default theme mixins (`light-theme-tokens`, `dark-theme-tokens`, and `colorblind-theme-tokens`).
- **Enforcement:** Enforced automatically by `node --experimental-strip-types scripts/contrast-check.ts`.
- **Consumer Overrides:** Consumers override tokens using CSS custom properties (`--ds-color-...`).

---

## 🛠️ 4. Internal Library Maintenance Rules

If an agent is instructed to modify or extend `@nftx-dev/vue-ds` itself, the following constraints are strictly binding:

1. **Zero External Headless UI Libraries:** Never install `reka-ui`, `radix-vue`, `@headlessui/vue`, `@floating-ui/dom`, or Popper. Always use native browser elements (`<dialog>`, native `[popover]`, CSS Anchor Positioning, `:has()`) plus the in-house composables under `src/composables/a11y/`.
2. **Component File Architecture:** Every component lives in its own dedicated directory under `src/components/Ds{Name}/` with the 6-file structure:
   - `Ds{Name}.vue` — Script coordinator (`<script setup lang="ts">`)
   - `Ds{Name}.html` — Pure template (`<template src="./Ds{Name}.html"></template>`)
   - `Ds{Name}.scss` — Scoped styling (`<style lang="scss" scoped src="./Ds{Name}.scss"></style>`)
   - `Ds{Name}.spec.ts` — Vitest unit tests in real browser environment
   - `Ds{Name}.stories.ts` — Storybook CSF3 stories
   - `index.ts` — Public export
3. **Quality Gate Verification:** No change is complete until `npm run verify` passes all automated steps:
   - `npm run lint` (ESLint 9 flat config)
   - `npm run typecheck` (`vue-tsc --noEmit`)
   - `npm run test:tokens` (Contrast & token symmetry check)
   - `npm run test:unit` (Vitest with 100% coverage requirement)
   - `npm run test:storybook` (Playwright Storybook test runner, 0 axe violations)
   - `npm run build` (Vite library rollup)
   - `npm run test:smoke` (npm pack tarball and consumer installation smoke test)
4. **Git Discipline:** Strictly **NEVER** run `git push`. Local commits only (`git commit`).
