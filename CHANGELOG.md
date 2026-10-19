# Changelog

All notable changes to `@nftx/vue-ds` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Layout & Page Primitives (Phase 4):**
  - `DsSkipLink`: Accessible landmark bypass link (first focusable element on page, WCAG 2.2 SC 2.4.1) with smooth scrolling and temporary programmatic focus handling.
  - `DsHeaderBar`: Semantic `<header>` landmark (`role="banner"`) with navigation slots, responsive mobile drawer toggle, theme switcher, and sticky positioning support (`scroll-padding-top` compliant).
  - `DsCardGrid`: Auto-fit responsive CSS grid layout with gap tokens and semantic list structure (`role="list"` / `<li>`) guaranteeing zero overflow at 320px width.
  - `DsEmptyState`: Feedback organism communicating empty search queries, zero-data states, or offline connection states with icons, semantic headings, and action CTAs.
  - `HomelabDashboardDemo`: Full-page integration Storybook demo verifying composition of layout, form atoms, and composite widgets with 0 axe violations.
- **Accessibility Composables (`src/composables/a11y/`):**
  - `useRovingFocus`: Bidirectional and linear roving tabindex navigation for interactive collections.
  - `useTypeahead`: Dynamic character-prefix search for menus and list components.
  - `useFocusReturn`: Preserves and restores focus to triggering elements on overlay close.
  - `useAnnouncer`: Live region announcer with polite and assertive queuing.
  - `useAnchorFallback`: Dynamic coordinate positioning for tethered menus where CSS Anchor Positioning is unsupported.
- **Composite & Overlay Widgets:**
  - `DsCard`: Semantic container (`<article>`) with media, header, body, footer slots and stretched-link overlay.
  - `DsChipGroup`: Accessible toggle button group (`role="group"`) with count badges and single/multi selection.
  - `DsSearchBar`: Semantic `<search>` landmark with input, search icon, clear button, and global hotkey focus (`/`, `⌘K`).
  - `DsSelect`: Native `<select>` progressive enhancement with custom dropdown styling and `DsField` context integration.
  - `DsTabs`: APG compliant tabs with automatic and manual selection modes, roving focus, and vertical layout support.
  - `DsMenu`: APG Menu Button using native Popover API (`popover="auto"`), anchor positioning, and typeahead.
  - `DsModal`: APG Dialog / Alert Dialog on native `<dialog>` and `showModal()`, focus trapping, escape key cancellation, and backdrop blur.
  - `DsToast`: Live notification toasts using Popover API (`popover="manual"`) with live region announcements via `useAnnouncer`, 4 semantic variants, auto-dismiss, and hover/focus pause.

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
- **Core Atoms (`ATOM-01`..`ATOM-05`):**
  - `DsIcon`: Lucide icon integration supporting direct component or kebab/Pascal case string names with logical sizing and standalone accessible modes.
  - `DsSpinner`: Animated SVG loading indicator with reduced-motion static pulse fallback and polite live region.
  - `DsButton`: Tag polymorphism (`<button>` or `<a>`), 4 variants, 3 sizes, loading spinner state, focus rings, and coarse target size.
  - `DsLink`: Accessible hyperlinks with external target blank detection, rel noopener noreferrer, and screen reader announcements.
  - `DsBadge`: Semantic status pills with 6 variants, dot indicators, and WCAG AA/AAA verified contrast.
- **Form Atoms (`FORM-01`..`FORM-06`):**
  - `DsField`: Accessible form control wrapper with `useId()` binding, hint, error, and contextual injection.
  - `DsInput`: Single-line text input with clear button, prefix/suffix slots, and transparent attribute inheritance.
  - `DsTextarea`: Auto-resizing textarea with character count and live region limits.
  - `DsCheckbox`: Styled checkbox supporting two-way boolean and array models, and 3-state indeterminate.
  - `DsRadioGroup`: Accessible fieldset/legend radio group with vertical/horizontal layouts.
  - `DsSwitch`: Accessible toggle switch using native checkbox semantics and animated thumb.

