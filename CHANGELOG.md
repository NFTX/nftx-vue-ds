# Changelog

All notable changes to `@nftx-dev/vue-ds` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-26

### Added
- **`DsTable`**: Semantic, accessible data table primitive with support for headers, footers, striped rows, hoverable rows, border styling, and compact density.
- **`DsTagGroup`**: Interactive tag management collection supporting dynamic tag creation, keyboard input, and tag removal events.
- **`DsTag` Removable Support**: Added accessible removable action button with keyboard focus and delete callbacks.

### Fixed
- **`DsModal`**: Centered dialog layout, removed coordinate-based click outside, and added frosted glass backdrop blur.
- **Token Alignment**: Corrected component SCSS variables to use canonical semantic tokens (`--ds-motion-duration-fast`, `--ds-motion-easing-default`, `--ds-color-focus-ring`, `--ds-color-border-hover`).

## [1.1.0] - 2026-10-22

### Added
- **New Components & Composables (`ENH-01`..`ENH-10`):**
  - `useTheme` & `DsThemeToggle` (`ENH-01`): Reactive theme management composable with `localStorage` persistence, `matchMedia('(prefers-color-scheme: dark)')` resolution, and standalone `cycle` / `segmented` theme switcher widget.
  - `DsTag` (`ENH-02`): Compact metadata tag atom (`size="xs" | "sm" | "md"`, `variant="subtle" | "outline" | "ghost" | "solid"`, `mono`, `icon`, `removable`) plus `subtle`, `ghost`, `outline` variants and `shape` prop on `DsBadge`.
  - `DsCode` & `DsKbd` (`ENH-03`): Monospace inline/block code primitive with copy-to-clipboard live-region announcement (`useAnnouncer`), and tactile keyboard keycap (`<kbd>`) atom.
  - `DsAlert` (`ENH-04`): Static inline callout banner (`info`, `success`, `warning`, `error`) with automatic `role="status"` / `role="alert"` semantics and optional dismiss action.
  - `DsCard` Enhancements (`ENH-05`): Added `divided` structural dividers, `interactive` hover/focus-within elevation, and `accent` top border (`brand`, `info`, `success`, `warning`, `error`).
  - `DsChipGroup` Enhancements (`ENH-06`): Added `allowEmpty` (guaranteeing an active filter when `false`), `variant="surface" | "elevated"`, `scrollable` horizontal strip, and `chips` prop alias.
  - `DsCardGrid` Enhancements (`ENH-07`): Added `mode="auto-fill" | "auto-fit"` (defaulting to `'auto-fill'` to prevent single-card stretching) and `minCardWidth` prop alias.
  - `DsDivider` (`ENH-08`): Horizontal and vertical structural separator with optional centered text/slot label.
  - `DsTooltip` (`ENH-09`): Native Popover + CSS Anchor Positioning tooltip satisfying WCAG 2.2 SC 1.4.13 (Dismissible via `Escape`, Hoverable, Persistent).
  - `DsFooterBar` (`ENH-10`): Semantic `<footer>` landmark with `start`, `center`, and `end` slots.
- **Tree-Shaken Curated Icon Registry (`DS-12`):**
  - Replaced `import * as LucideIcons` barrel import with curated named imports in `src/components/DsIcon/iconRegistry.ts` and exported `registerDsIcons()` for custom icon registration, cutting consumer bundle size by >80%.
- **Three Default Themes Architecture (`TOK-04`, `A11Y-01`..`03`):**
  - **Default Light Theme**: Editorial Warm Paper canvas (`#FAF8F5`) with Print Ink Red titling/fill (`#750008`, 11.26:1 AAA) and Deep Charcoal primary text (`#1E293B`, 13.80:1 AAA).
  - **Default Dark Theme**: Velvet Midpoint oxblood canvas (`#3C0911`) with Pale Champagne gold illumination (`#FDE68A`, 13.61:1 AAA) and anti-glare Warm Antique Ivory body text (`#F7F4EE`, 15.44:1 AAA) eliminating optical irradiation in low-light environments.
  - **Default Color Blind Theme**: Scientifically formulated Okabe-Ito Universal CVD palette built for the "worst-case" scenario across Protanopia, Deuteranopia, Tritanopia, and complete Achromatopsia (monochromacy) using pure Royal Cobalt Navy (`#003E7E`, 10.55:1 AAA), Amber (`#9A3412`), Deep Pine Teal (`#004D40`), and Brick Rust (`#880000`) on Crisp Pure White (`#FFFFFF`).
  - **Legacy Tech Slate Opt-in**: Retained `@mixin slate-light-tokens` and `@mixin slate-dark-tokens` accessible via `[data-theme='slate-light']` and `[data-theme='slate-dark']`.
- **Theme Switching & Integration:**
  - `DsHeaderBar`: Expanded `DsThemeMode` to `'light' | 'dark' | 'colorblind' | 'auto'`, added `availableThemes` prop with 3-way cycling, updated theme toggle aria-label, and dynamic icon rendering (`sun`, `moon`, `eye`).
  - `HomelabDashboardDemo`: Integrated 3-theme switching bar and verified token cascading across all card and status components.
  - `EditorialBlogPostDemo`: Added live 3-theme presets selector and SVG color matrix CVD Simulator (Normal, Deuteranopia, Protanopia, Tritanopia, Achromatopsia/Grayscale).
- **Automated Verification (`DS-01`, `DS-09`, `DS-17`):**
  - `scripts/contrast-check.ts`: Enforces 55-token symmetry across all 5 themes, 33 WCAG 2.2 contrast assertions (AAA/AA), ΔE(OKLab) perceptual separation check, zero undefined `var(--ds-*)` token references, and zero hardcoded color literals in component SCSS.

### Fixed
- **Token Architecture & Styling (`DS-01`, `DS-04`, `DS-09`, `DS-15`):**
  - Defined `--ds-shadow-xl`, `--ds-font-sans`, `--ds-font-mono`, `--ds-font-weight-*`, `--ds-color-border-hover`, `--ds-color-border-focus`, `--ds-color-border-error`, `--ds-color-focus-ring-error`, `--ds-color-bg-backdrop`, `--ds-color-bg-glass`, and `--ds-color-border-glass` across all themes.
  - Replaced physical CSS border properties in `DsTabs.scss` with logical `border-block-start` and `border-inline`.
- **Accessibility & Behavioral Fixes (`DS-02`..`DS-16`):**
  - `useAnnouncer` (`DS-02`): Lazily mounts singleton `#ds-announcer-polite` and `#ds-announcer-assertive` live regions in `document.body` so `DsToast` and `DsCode` announcements work out of the box.
  - `DsMenu` & `useAnchorFallback` (`DS-03`): Per-instance `--ds-menu-anchor-name` custom property, SSR-safe `globalThis.CSS?.supports` check, logical `inset-*` properties, and `ArrowUp` opening menu on last enabled item.
  - `DsCard` (`DS-04`): Added automatic `rel="noopener noreferrer"` and `<DsVisuallyHidden> (opens in a new tab)</DsVisuallyHidden>` on `target="_blank"`.
  - `DsEmptyState` (`DS-05`): Fixed `#description` slot scoping and `aria-describedby` binding when using slot content.
  - `DsSelect` & `DsSwitch` (`DS-06`, `DS-14`): Added `inheritAttrs: false` and preserved numeric option value types in `DsSelect`.
  - `DsModal` (`DS-10`): Added `dismissible` prop (defaulting to `false` when `role="alertdialog"`) to prevent accidental `Escape` dismissal on critical alerts.
  - `DsToast` (`DS-11`): Replaced `<div>` with `<section>` landmark and hardwired `--ds-z-index-toast`.
  - `DsButton` (`DS-13`): Added `iconOnly` and `outline` variant support plus dev-mode accessibility warning when `aria-label` is missing on icon-only buttons.
  - `DsField` (`DS-14`): Preserved `#hint` text in DOM alongside error messages so both remain referenced by `aria-describedby`.
  - `DsSkipLink` & `DsSearchBar` (`DS-16`): Respected `prefers-reduced-motion: reduce` on skip link scrolling and bound `Escape` to clear search input.


## [1.0.0] - 2026-10-19

### Fixed
- **Documentation:** Fixed MDX syntax in `Colors.mdx` where LaTeX `{OKLab}` was parsed as an undefined JavaScript variable at runtime.

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
- **Composite & Overlay Widgets (Phase 3):**
  - `DsCard`: Semantic container (`<article>`) with media, header, body, footer slots and stretched-link overlay.
  - `DsChipGroup`: Accessible toggle button group (`role="group"`) with count badges and single/multi selection.
  - `DsSearchBar`: Semantic `<search>` landmark with input, search icon, clear button, and global hotkey focus (`/`, `⌘K`).
  - `DsSelect`: Native `<select>` progressive enhancement with custom dropdown styling and `DsField` context integration.
  - `DsTabs`: APG compliant tabs with automatic and manual selection modes, roving focus, and vertical layout support.
  - `DsMenu`: APG Menu Button using native Popover API (`popover="auto"`), anchor positioning, and typeahead.
  - `DsModal`: APG Dialog / Alert Dialog on native `<dialog>` and `showModal()`, focus trapping, escape key cancellation, and backdrop blur.
  - `DsToast`: Live notification toasts using Popover API (`popover="manual"`) with live region announcements via `useAnnouncer`, 4 semantic variants, auto-dismiss, and hover/focus pause.
- **Consumer Application Integration (Phase 5):**
  - Full migration of `/workspace/Projects/portal` homelab dashboard to `@nftx/vue-ds`.
  - Replaced legacy headers, filters, cards, and automation sections with `DsHeaderBar`, `DsSearchBar`, `DsChipGroup`, `DsCardGrid`, `DsCard`, `DsBadge`, `DsEmptyState`, and `DsSpinner`.
  - Mapped portal CSS variables directly to design system semantic tokens (`--ds-color-*`).
- **Production Readiness & Static Distribution (Phase 6):**
  - Static Storybook build verified (`npm run build-storybook`) with Foundations MDX documentation, component autodocs, and full-page layout demo.
  - Final quality gate verification passed across all 7 CI commands.

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

