# Normative Implementation & Validation Guidelines (`@nftx/vue-ds`)

This document is the binding specification for implementing and validating `@nftx/vue-ds`.
Where [DESIGN_SYSTEM_PLAN.md](./DESIGN_SYSTEM_PLAN.md) defines scope and roadmap, this file defines the rules every file, component, style, story, and test must satisfy.

---

## 1. Authority, Rule IDs & Validation Model

- `META-01`: Every rule in this document has a unique identifier (`<DOMAIN>-<NN>`). Cite the rule ID in code review findings, test names, and audit reports.
- `META-02`: All rules are mandatory. A single violated rule blocks component completion and fails validation (§13).
- `META-03`: When a rule conflicts with convenience or speed, the rule wins. Propose rule changes explicitly before deviating.
- `META-04`: Keep the repository 100% generic. Never commit machine paths, local IPs, private hostnames, or consumer-app names.

---

## 2. Core Engineering & Platform Principles

- `ARCH-01`: Zero headless UI libraries are permitted in `dependencies` or `peerDependencies`. Runtime dependencies are limited to `vue` (peer) and `lucide-vue-next`.
- `ARCH-02`: When a native HTML element provides the required semantics and behavior (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<fieldset>`, `<dialog>`, `[popover]`), use the native element instead of ARIA role re-implementations.
- `ARCH-03`: When native HTML lacks a required WAI-ARIA Authoring Practices Guide (APG) behavior, implement that behavior as a small, single-responsibility composable inside `src/composables/a11y/`.
- `ARCH-04`: Target evergreen browsers supporting Baseline 2026 features (Chromium, Firefox, WebKit). Verify behavior across all three browser engines in automated tests.
- `ARCH-05`: Ensure all components are SSR-safe. Never access `window`, `document`, `navigator`, or `Element` prototypes during `<script setup>` evaluation; guard DOM access inside `onMounted` or event handlers.
- `ARCH-06`: Operate 100% offline at runtime. Never load external fonts, icons, stylesheets, or scripts from a CDN or remote URL.
- `ARCH-07`: Enforce single responsibility per file and per function. Split helper logic exceeding 40 lines into a dedicated composable or utility module.

---

## 3. File Structure, TypeScript & Vue Component Rules

### 3.1 Three-File Component Split

- `VUE-01`: Place each component in `src/components/Ds<Name>/` with six required files:
  - `Ds<Name>.vue` (script and `<template src>` / `<style src>` wiring only)
  - `Ds<Name>.html` (pure template markup)
  - `Ds<Name>.scss` (scoped component styles)
  - `Ds<Name>.stories.ts` (Storybook 10 stories and `play()` interaction tests)
  - `Ds<Name>.spec.ts` (Vitest browser-mode unit and behavioral tests)
  - `index.ts` (named export of the component and its public TypeScript types)
- `VUE-02`: Prefix every component name and filename with `Ds` (for example, `DsButton`, `DsModal`).
- `VUE-03`: In `Ds<Name>.vue`, reference the external template and stylesheet via `<template src="./Ds<Name>.html"></template>` and `<style lang="scss" scoped src="./Ds<Name>.scss"></style>`.
- `VUE-04`: Never place TypeScript type assertions (`as Type`), non-null assertions (`!.`), or complex multi-statement expressions inside `.html` templates. Move all typed event and DOM handling into named functions in `<script setup lang="ts">`.
- `VUE-05`: Use `defineProps<Ds<Name>Props>()` and `defineEmits<Ds<Name>Emits>()` with exported TypeScript interfaces so consumers can import prop and emit types.
- `VUE-06`: Use `withDefaults(defineProps<...>(), { ... })` or reactive props destructuring for default values; document every default in JSDoc on the prop interface.
- `VUE-07`: Use `defineModel<T>()` for all two-way bound props (`v-model`, `v-model:open`).
- `VUE-08`: Generate all internal DOM IDs (`id`, `for`, `aria-labelledby`, `aria-describedby`, `aria-controls`) with Vue's `useId()`. Never use `Math.random()` or module-level counters that diverge between SSR and hydration.
- `VUE-09`: When the visual root element wraps an inner interactive control (such as `DsInput` with a wrapper `<div>` for icons and clear button), set `defineOptions({ inheritAttrs: false })` and bind `v-bind="$attrs"` directly to the interactive `<input>`, `<select>`, or `<textarea>`.
- `VUE-10`: Clean up all side effects (`addEventListener`, `ResizeObserver`, `MutationObserver`, timers) inside `onScopeDispose` or `onUnmounted`.

### 3.2 TypeScript Configuration

- `TS-01`: Enable `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`, and `"exactOptionalPropertyTypes": false` in `tsconfig.json`.
- `TS-02`: Set `"noUnusedLocals": false` in `tsconfig.json` so imports used only in external `.html` templates do not trigger false-positive compiler errors; enforce unused-variable checks via ESLint instead.
- `TS-03`: Use `@/*` path aliases for all internal imports. Never use relative parent traversals (`../`).
- `TS-04`: Forbidden in production and test code: `any`, `@ts-ignore`, and `@ts-nocheck`. If an escape hatch is unavoidable, use `@ts-expect-error` followed by a comment explaining the upstream type defect.

---

## 4. Design Tokens, Themes & Cascade Layers

- `TOK-01`: Organize tokens in three strict tiers:
  1. Primitive (`--ds-rose-800`, `--ds-slate-900`, `--ds-space-4`): raw scale values; never referenced directly in component SCSS.
  2. Semantic (`--ds-color-brand-fill`, `--ds-color-text-primary`, `--ds-color-border-default`): role-based values that switch per theme; the primary tier consumed by components.
  3. Component (`--ds-button-bg`, `--ds-modal-max-width`): optional component-scoped custom properties that default to semantic tokens.
- `TOK-02`: Declare CSS cascade layers at the top of the stylesheet entry: `@layer ds.tokens, ds.base, ds.components;`. Place all token definitions in `@layer ds.tokens`, reset rules in `@layer ds.base`, and component styles in `@layer ds.components` so unlayered consumer styles always override design-system styles without `!important`.
- `TOK-03`: Support three theme modes without JavaScript flash:
  - Explicit light: `:root, [data-theme="light"]`
  - Explicit dark: `[data-theme="dark"]`
  - System automatic: `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }`
- `TOK-04`: Define every semantic token in both light and dark themes. An undefined custom property in either theme fails validation (`scripts/contrast-check.ts`).
- `TOK-05`: Zero all non-essential transition and animation duration tokens inside `@media (prefers-reduced-motion: reduce)`.
- `TOK-06`: Keep viewport breakpoint values as SCSS variables (`$ds-bp-sm: 40rem`, `$ds-bp-md: 48rem`, `$ds-bp-lg: 64rem`, `$ds-bp-xl: 80rem`) because CSS custom properties cannot be used inside `@media` query conditions.

---

## 5. CSS, SCSS & Styling Discipline

- `CSS-01`: Use Dart Sass with the `modern-compiler` API and `@use` / `@forward` syntax. Never use deprecated `@import`, global color functions, or `/`-division.
- `CSS-02`: Never hardcode hex colors, RGB/HSL values, pixel spacing, font families, z-indices, or shadow values inside `Ds<Name>.scss`. Reference semantic tokens (`var(--ds-*)`).
- `CSS-03`: Use CSS logical properties (`margin-inline`, `padding-block`, `inset-inline-end`, `border-start-start-radius`, `text-align: start`) instead of physical left/right/top/bottom properties.
- `CSS-04`: Use `rem` units for typography, spacing, and component dimensions so layouts scale when the user changes the browser's root font size (WCAG SC 1.4.4). Use `px` (or `rem` equivalent) only for hairline borders (`1px`, `2px`) and focus-ring widths/offsets.
- `CSS-05`: Never use `!important` in component stylesheets.
- `CSS-06`: Never style elements by targeting internal DOM structure of child `Ds*` components; communicate across components via props, CSS variables, or slots.
- `CSS-07`: Support Windows High Contrast / Forced Colors mode (`@media (forced-colors: active)`):
  - Map focus rings to `Highlight`.
  - Ensure interactive borders use `ButtonText` or `CanvasText` rather than relying on background fill differences alone.
  - Disable decorative `box-shadow` and `backdrop-filter` when `forced-colors: active` is active.
- `CSS-08`: For any translucent or glass surface (`DsCard` glass variant), provide an opaque fallback surface under `@media (prefers-reduced-transparency: reduce)` and `@media (forced-colors: active)`.

---

## 6. Responsiveness, Fluid Layout & Touch Targets

- `RESP-01`: Write mobile-first styles. Base rules target the smallest viewport (`320px` CSS width); add `@media (min-width: ...)` queries only to enhance layout at wider viewports.
- `RESP-02`: Every component and layout composition must render at `320px` CSS viewport width with zero horizontal overflow (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), satisfying WCAG SC 1.4.10 Reflow.
- `RESP-03`: Every component must remain functional and unclipped at 200% browser zoom and when WCAG SC 1.4.12 text-spacing overrides are applied (`line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, paragraph spacing `2em`).
- `RESP-04`: Enforce minimum interactive target sizes via the shared `target-size` mixin:
  - Default (fine pointer): minimum `24px × 24px` (`1.5rem × 1.5rem`) hit area (WCAG 2.2 SC 2.5.8).
  - Coarse pointer (`@media (pointer: coarse)`): minimum `44px × 44px` (`2.75rem × 2.75rem`) hit area.
  - When a visual control is smaller than its minimum target (such as a compact icon or checkbox), expand its hit area using a centered `::before` pseudo-element or padding without shifting surrounding layout.
- `RESP-05`: Never trigger hover-only interactions without an equivalent keyboard and touch interaction. Guard purely decorative hover styles inside `@media (hover: hover) and (pointer: fine)`.
- `RESP-06`: Prefer intrinsic fluid layouts (`flex-wrap`, CSS Grid `repeat(auto-fit, minmax(min(100%, var(--ds-grid-min, 16rem)), 1fr))`, `clamp()`, and container queries) over rigid fixed-width breakpoint jumps.
- `RESP-07`: Never lock viewport scaling or orientation.

---

## 7. Accessibility (WCAG 2.2 AA & WAI-ARIA APG)

### 7.1 Contrast & Color Independence

- `A11Y-01`: Maintain normal text contrast ≥ 4.5:1 (AA) and large text (`≥ 24px` or `≥ 18.66px` bold) contrast ≥ 3:1 across all states (`default`, `hover`, `focus`, `active`) in both light and dark themes (WCAG SC 1.4.3).
- `A11Y-02`: Maintain ≥ 3:1 contrast for all non-text UI boundaries (input borders, checkbox/radio/switch boundaries, icon-only controls, focus rings) against adjacent surfaces (WCAG SC 1.4.11).
- `A11Y-03`: Preserve perceptual separation between brand tokens and error tokens of `ΔE(OKLab) ≥ 10` in both light and dark themes.
- `A11Y-04`: Never use color as the sole visual means of conveying status, error, required state, or selection (WCAG SC 1.4.1). Pair every status or validation state with a semantic icon (`lucide-vue-next`) and explicit text or accessible label.

### 7.2 Focus Visibility, Order & Non-Obscuration

- `A11Y-05`: Apply the shared `focus-ring` mixin to `:focus-visible` on every interactive element: `outline: 2px solid var(--ds-color-focus-ring); outline-offset: 2px;`. Never set `outline: none` without an immediate high-contrast replacement that works in `forced-colors: active`.
- `A11Y-06`: Ensure focused elements are never obscured by sticky headers, footers, or floating bars (WCAG 2.2 SC 2.4.11). Set `scroll-padding-top: var(--ds-header-height, 4rem)` on scroll containers when `DsHeaderBar` is sticky.
- `A11Y-07`: Preserve logical DOM order matching visual order. Never use positive `tabindex` values (`tabindex="1"`, etc.); only `tabindex="0"` and `tabindex="-1"` are permitted.

### 7.3 Names, Roles, Labels & Forms

- `A11Y-08`: Every interactive control must have a programmatic accessible name (`<label for>`, `aria-label`, or `aria-labelledby`).
- `A11Y-09`: Form controls (`DsInput`, `DsTextarea`, `DsSelect`) must always display a persistent visible label via `DsField`. Placeholders disappear on input and are forbidden as a substitute for labels; floating labels are forbidden.
- `A11Y-10`: `DsField` must automatically wire:
  - `<label :for="controlId">`
  - `aria-describedby` combining hint ID and error ID (when present, in `hintId errorId` order)
  - `aria-invalid="true"` on the control when an error message is present
  - Error message container with an icon and text
- `A11Y-11`: Icon-only buttons (`DsButton` without default slot text) must require an explicit `ariaLabel: string` prop at the TypeScript level (or emit a development warning and fail unit tests if omitted). Decorative icons inside labeled buttons must set `aria-hidden="true"`.

### 7.4 Keyboard & ARIA Contracts for Native + Composable Widgets

Every interactive component must implement its WAI-ARIA APG keyboard contract:

- `A11Y-12` (`DsButton` / `DsChipGroup`):
  - Use native `<button type="button">` (default `type="button"` to prevent accidental form submission).
  - Activate on `Enter` and `Space`.
  - When `loading="true"`, set `aria-busy="true"` and `disabled` (or `aria-disabled="true"` when focus retention is required) and render `DsSpinner`.
  - In `DsChipGroup`, each filter chip is a `<button type="button" :aria-pressed="selected">` inside `<div role="group" :aria-label="groupLabel">`.
- `A11Y-13` (`DsSwitch`):
  - Use `<button type="button" role="switch" :aria-checked="modelValue">`.
  - Toggle on `Space` and `Enter`.
- `A11Y-14` (`DsCheckbox` & `DsRadioGroup`):
  - Use native `<input type="checkbox">` (supporting `.indeterminate` property sync) and `<input type="radio">` inside `<fieldset>` + `<legend>`.
  - Style custom visuals using `:focus-visible` on the native input without hiding the input via `display: none` (use opacity/size overlay so screen readers and touch hit areas remain native).
- `A11Y-15` (`DsSelect`):
  - Use native `<select>` with `<option>` / `<optgroup>` for full OS/mobile/screen-reader accessibility out of the box.
  - Apply custom closed-state styling and `@supports (appearance: base-select)` progressive enhancement where supported.
- `A11Y-16` (`DsTabs` + `useRovingFocus`):
  - Structure: `<div role="tablist" :aria-orientation="orientation">` containing `<button role="tab" :id="tabId" :aria-selected="active" :aria-controls="panelId" :tabindex="active ? 0 : -1">` and sibling `<div role="tabpanel" :id="panelId" :aria-labelledby="tabId" tabindex="0">`.
  - Keyboard (`useRovingFocus`): `ArrowRight` / `ArrowLeft` (horizontal) or `ArrowDown` / `ArrowUp` (vertical) moves focus across enabled tabs and wraps from last to first; `Home` moves to first enabled tab; `End` moves to last enabled tab; skip disabled tabs.
  - Support automatic activation (default: focus change selects tab) and manual activation (`manual` prop: `Enter` / `Space` selects focused tab).
- `A11Y-17` (`DsMenu` + Popover API + `useRovingFocus` + `useTypeahead`):
  - Trigger: `<button type="button" :aria-expanded="open" aria-haspopup="menu" :aria-controls="menuId">`.
  - Surface: `<div :id="menuId" role="menu" popover="auto">` positioned via CSS Anchor Positioning (`anchor-name` / `position-anchor` / `@position-try`) with `useAnchorFallback` when unsupported.
  - Keyboard:
    - On trigger: `Enter`, `Space`, or `ArrowDown` opens menu and focuses first enabled `menuitem`; `ArrowUp` opens menu and focuses last enabled `menuitem`.
    - Inside menu: `ArrowDown` / `ArrowUp` cycles enabled items (wraps); `Home` / `End` jumps to first/last; printable character keys move focus to the next item starting with the typed string (`useTypeahead` with 500ms buffer reset); `Enter` / `Space` activates item and closes menu; `Escape` or `Tab` closes menu and returns focus to trigger (`Escape`).
- `A11Y-18` (`DsModal` + `<dialog>` + `useFocusReturn`):
  - Render native `<dialog ref="dialogEl" :role="role" :aria-labelledby="titleId" :aria-describedby="descId">`, where `role` is `'dialog'` (default) or `'alertdialog'`.
  - Open exclusively via `dialogEl.showModal()` so the browser places the dialog in the top layer, traps Tab focus natively, and makes background document content `inert`.
  - Intercept native `cancel` event (`Escape` key) to respect `dismissible` prop (`role="alertdialog"` defaults to `dismissible: false` unless explicitly enabled).
  - Support backdrop click dismissal only when clicking directly on the `<dialog>` backdrop box (`event.target === dialogEl`) and `dismissible` is `true`.
  - Restore focus to the element that was active before opening via `useFocusReturn` when the modal closes.
  - Heading inside modal uses configurable `headingTag` prop (`'h2'` default) so consumers preserve page heading hierarchy.
- `A11Y-19` (`DsToast` + `useAnnouncer`):
  - Render visual toasts inside a non-blocking `<section aria-label="Notifications" popover="manual">` top-layer region so toasts sit above modals without stealing focus.
  - Announce messages through `useAnnouncer` (`aria-live="polite"` for info/success/warning, `aria-live="assertive"` for errors).
  - Auto-dismiss timers must pause on pointer `:hover` and when any element inside the toast region has `:focus-within` (WCAG SC 2.2.1).
  - Error toasts (`variant="error"`) must never auto-dismiss (`duration = 0` enforced) and must include an explicit close button.

### 7.15 Manual Accessibility Verification Checklist

Every component and page composition must pass these manual checks prior to phase sign-off:

- [ ] **Keyboard-only walkthrough:** Unplug or ignore pointer; reach and operate every control using only `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `Arrow` keys, `Home`, and `End`. Verify focus ring is always visible and never trapped (except inside open `DsModal`, which releases on `Escape`).
- [ ] **Screen reader verification:**
  - Windows: NVDA with Firefox or Chrome. Verify announced role, accessible name, state (`checked`, `expanded`, `pressed`, `invalid`, `busy`), and `aria-describedby` hint/error announcements.
  - Mobile / macOS (when available): VoiceOver rotor and swipe navigation.
- [ ] **200% Zoom & 320px Reflow:** Set viewport to `1280×1024` at 400% zoom (equivalent to `320px` CSS width). Confirm zero horizontal scrollbar, no overlapping text, and all controls remain operable.
- [ ] **Text spacing bookmarklet / override:** Apply SC 1.4.12 spacing styles (`line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important;`). Confirm no clipped labels or truncated buttons.
- [ ] **Forced colors emulation:** In DevTools Rendering panel, enable `forced-colors: active`. Confirm borders, focus rings, and state indicators remain distinct.
- [ ] **Reduced motion emulation:** Enable `prefers-reduced-motion: reduce`. Confirm transitions/animations complete instantaneously without jarring layout shifts.

---

## 8. Storybook 10 & Interactive Documentation

- `SB-01`: Configure Storybook 10 (`@storybook/vue3-vite`) with `@storybook/addon-a11y`, `@storybook/addon-themes`, and `@storybook/addon-vitest`.
- `SB-02`: Set `parameters: { a11y: { test: 'error' } }` globally in `.storybook/preview.ts` so any `axe-core` violation fails the automated Storybook test run. Never disable an `axe` rule in a story without a documented justification in `DESIGN_SYSTEM_PLAN.md` §11.
- `SB-03`: Every component `.stories.ts` file must export:
  1. `Default` story with full interactive `argTypes` controls.
  2. One story per visual variant (`Primary`, `Secondary`, `Ghost`, `Danger`, etc.).
  3. Explicit state stories: `Disabled`, `Loading` (where applicable), `WithError` (for form controls), `LongContentEdgeCase` (verifying wrapping/truncation), and `KeyboardInteraction` (with a `play()` function).
- `SB-04`: Categorize stories in the sidebar under `Foundations/*`, `Atoms/*`, `Molecules/*`, or `Organisms/*`.
- `SB-05`: Enable `tags: ['autodocs']` on every component meta and include a JSDoc component summary plus a Markdown table of supported keyboard shortcuts referencing the WAI-ARIA APG pattern.

---

## 9. Testing Architecture & Coverage Gates

### 9.1 Test Layers

- `TEST-01`: Every component and composable must be verified by four automated test layers before submission:
  1. Static analysis (`eslint`, `vue-tsc`, style/token checks)
  2. Token & contrast verification (`scripts/contrast-check.ts`)
  3. Vitest browser-mode unit & behavioral specs (`*.spec.ts`)
  4. Storybook 10 interaction (`play()`) & `axe-core` accessibility tests (`*.stories.ts`)

### 9.2 Browser-Mode Unit & Component Tests

- `TEST-02`: Run component and composable tests in **Vitest Browser Mode** (`@vitest/browser` with Playwright provider) rather than `jsdom` or `happy-dom`, because native `<dialog>.showModal()`, Popover API (`showPopover()`), CSS Anchor Positioning, computed styles, `:focus-visible`, and real tab order are either missing or inaccurate in simulated DOMs.
- `TEST-03`: Run the browser test suite against `chromium` on every local run and against all three engines (`chromium`, `firefox`, `webkit`) in CI.

### 9.3 Coverage Thresholds & Enforcement

- `TEST-04`: Configure V8 coverage (`@vitest/coverage-v8`) in `vitest.config.ts` with `thresholds` that fail the test command if any metric drops below:
  - **Global (`src/components/**`, `src/utils/**`):**
    - Lines: `≥ 90%`
    - Statements: `≥ 90%`
    - Functions: `≥ 90%`
    - Branches: `≥ 85%`
  - **Accessibility & Core Composables (`src/composables/**`):**
    - Lines: `100%`
    - Statements: `100%`
    - Functions: `100%`
    - Branches: `≥ 95%`
- `TEST-05`: Never use `/* v8 ignore */` or `/* istanbul ignore */` comments to artificially pass coverage thresholds without an explicit justification citing an unreachable browser-engine branch.

### 9.4 Component Test Contract (`Ds<Name>.spec.ts`)

- `TEST-06`: Every `Ds<Name>.spec.ts` file must include explicit assertions for:
  1. **Rendering & Props:** Every prop variant, size, and boolean state renders the expected semantic element, classes, and attributes.
  2. **Two-Way Binding & Events:** Every `v-model` and emitted event fires with the exact expected payload on user interaction, and does **not** fire when `disabled` or `loading`.
  3. **Slots & Fallbacks:** Default slot, named slots, and scoped slot props render accurately.
  4. **Attribute Pass-Through:** Extra attributes (`data-testid`, `aria-*`, `name`) land on the semantic interactive element (`VUE-09`).
  5. **Accessibility Attributes:** `role`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-expanded`, `aria-checked`, `aria-pressed`, and `aria-busy` match state transitions.
  6. **Keyboard Contract:** Every key listed in `§7.4` for that widget produces the required focus movement or state change using real user keyboard events (`userEvent.keyboard`).
  7. **SSR Safety:** Calling `renderToString` from `@vue/server-renderer` on the component completes without throwing reference errors (`ARCH-05`).

### 9.5 Accessibility Composable Test Contract (`src/composables/a11y/*.spec.ts`)

- `TEST-07`: Each composable in `src/composables/a11y/` must have a dedicated `.spec.ts` suite testing:
  - `useRovingFocus`: horizontal and vertical arrow navigation, `Home`/`End` keys, wrapping from last to first and first to last, skipping disabled items, dynamic item insertion/removal, and cleanup on unmount.
  - `useTypeahead`: single-character match, multi-character rapid buffer within 500ms, buffer reset after 500ms, wrap-around search from current index, and ignoring modifier keys (`Ctrl`, `Alt`, `Meta`).
  - `useFocusReturn`: capturing the previously focused trigger element on open, restoring focus on close, and handling the edge case where the trigger element was removed from the DOM while open.
  - `useAnnouncer`: polite and assertive message injection, clearing/re-announcing identical consecutive messages, and singleton region cleanup.
  - `useAnchorFallback`: bounding-rect calculation and viewport flip fallback when CSS Anchor Positioning is stubbed as unsupported.

### 9.6 Storybook Interaction (`play()`) & Axe Gates

- `TEST-08`: Every interactive component must include at least one `play()` function in `Ds<Name>.stories.ts` using `storybook/test` (`within`, `userEvent`, `expect`) that walks through the component's primary user flow and verifies focus placement (`expect(element).toHaveFocus()`).
- `TEST-09`: Execute `axe-core` assertions against every story in both `[data-theme="light"]` and `[data-theme="dark"]` modes. Zero violations are permitted (`SB-02`).

### 9.7 Negative & Edge-Case Testing

- `TEST-10`: Include negative and boundary tests in every component suite:
  - Clicking or pressing `Enter`/`Space` on a `disabled` or `loading` control must not emit activation events.
  - Pressing `Escape` on a non-dismissible `DsModal` (`dismissible: false` or `role="alertdialog"`) must not close the modal.
  - Empty options arrays (`DsSelect`, `DsMenu`, `DsTabs`, `DsChipGroup`) and 100+ character unbroken strings must render without runtime exceptions or horizontal overflow at `320px` width.

### 9.8 Token & Contrast Verification (`scripts/contrast-check.ts`)

- `TEST-11`: `scripts/contrast-check.ts` must parse the compiled token stylesheets and assert:
  1. Every semantic token present in `:root, [data-theme="light"]` is also present in `[data-theme="dark"]`.
  2. Every foreground/background pair declared in `DESIGN_SYSTEM_PLAN.md` §3 meets its required WCAG 2.2 contrast threshold (`≥ 4.5:1` for AA normal text, `≥ 7.0:1` for AAA text, `≥ 3.0:1` for UI boundaries and focus rings).
  3. Brand vs. error perceptual distance `ΔE(OKLab)` is `≥ 10.0` in both light and dark themes.

### 9.9 Consumer Package Smoke Test (`scripts/smoke-consumer.ts`)

- `TEST-12`: After `npm run build`, pack the library (`npm pack`) and install the tarball into an isolated minimal Vite + Vue + TypeScript fixture project. Run `vue-tsc --noEmit` and `vite build` in that fixture to prove:
  - All package `exports` (`.`, `./styles.css`, `./tokens.css`, `./scss`) resolve cleanly.
  - Generated `.d.ts` files contain zero unresolved `@/*` path aliases (`TS-03`).
  - Tree-shaking works when importing a single component (`import { DsButton } from '@nftx/vue-ds'`).

---

## 10. Per-Component Definition of Done (`DOD-*`)

A component is complete only when **every** item below is checked:

- [ ] `DOD-01`: All six files exist in `src/components/Ds<Name>/` following `VUE-01`–`VUE-10` and `TS-01`–`TS-04`.
- [ ] `DOD-02`: Styles use only semantic/component tokens (`CSS-02`), logical properties (`CSS-03`), `rem` sizing (`CSS-04`), `@layer ds.components` (`TOK-02`), and include `forced-colors` (`CSS-07`) and coarse-pointer target sizing (`RESP-04`).
- [ ] `DOD-03`: Component renders with zero horizontal overflow at `320px` width (`RESP-02`) and survives SC 1.4.12 text-spacing overrides (`RESP-03`).
- [ ] `DOD-04`: All WAI-ARIA APG roles, states, and keyboard shortcuts in `§7.4` are implemented using native HTML and `src/composables/a11y/*` with zero external UI libraries (`ARCH-01`).
- [ ] `DOD-05`: `Ds<Name>.stories.ts` exports all required variant, state, edge-case, and `play()` stories (`SB-03`) with autodocs and keyboard table (`SB-05`).
- [ ] `DOD-06`: `Ds<Name>.spec.ts` satisfies the full test contract (`TEST-06`, `TEST-10`), passes in Chromium, Firefox, and WebKit (`TEST-03`), and meets or exceeds coverage gates (`TEST-04`).
- [ ] `DOD-07`: Zero `axe-core` violations in both light and dark themes (`TEST-09`).
- [ ] `DOD-08`: Component and its prop/emit types are exported from `src/index.ts` and verified by the consumer smoke test (`TEST-12`).
- [ ] `DOD-09`: Manual checklist in `§7.15` completed and recorded in the phase validation report.

---

## 11. CI/CD Quality Gates & Scripts

- `CI-01`: Define the following standardized scripts in `package.json`:
  - `npm run lint`: ESLint (`eslint .`) + style/token lint
  - `npm run typecheck`: `vue-tsc --noEmit`
  - `npm run test:tokens`: `node --experimental-strip-types scripts/contrast-check.ts`
  - `npm run test:unit`: `vitest run --project=unit --coverage`
  - `npm run test:storybook`: `vitest run --project=storybook`
  - `npm run build`: Vite library build + `.d.ts` generation
  - `npm run test:smoke`: `node --experimental-strip-types scripts/smoke-consumer.ts`
  - `npm run verify`: runs all seven commands above sequentially (`lint && typecheck && test:tokens && test:unit && test:storybook && build && test:smoke`)
- `CI-02`: `npm run verify` must exit with code `0` and zero warnings before any phase can be marked complete.
- `CI-03`: Run the Playwright browser test matrix across `chromium`, `firefox`, and `webkit` in CI on every pull request and release tag.

---

## 12. Packaging, Exports & Versioning

- `PKG-01`: Publish as ESM-only (`"type": "module"`) under the name `@nftx/vue-ds` with `"sideEffects": ["**/*.css"]`.
- `PKG-02`: Expose explicit subpath exports in `package.json`:
  - `"."`: `{ "types": "./dist/index.d.ts", "import": "./dist/index.js" }`
  - `"./styles.css"`: `"./dist/styles.css"`
  - `"./tokens.css"`: `"./dist/tokens.css"`
  - `"./scss"`: `"./src/styles/_index.scss"`
- `PKG-03`: Externalize `vue` in `vite.config.ts` (`build.rollupOptions.external: ['vue']`) so Vue is never bundled into `dist/`.
- `PKG-04`: Follow Semantic Versioning (`SemVer`) and record every added, changed, fixed, or breaking item in `CHANGELOG.md` prior to tagging a release.

---

## 13. Validation Protocol & Audit Scorecard

When an implementation (or phase) is submitted for validation, the validator will execute the following protocol without exception:

### 13.1 Automated Audit Steps

1. **Dependency & Genericity Audit (`META-04`, `ARCH-01`):**
   - Inspect `package.json` to confirm no headless UI libraries exist and only `vue` (peer) and `lucide-vue-next` are runtime dependencies.
   - Scan all tracked files for forbidden personal paths, IPs, hostnames, or consumer-app names.
2. **Structure & Code Hygiene Audit (`VUE-*`, `TS-*`, `CSS-*`, `TOK-*`):**
   - Verify every `src/components/Ds*/` folder contains the 6 required files (`VUE-01`).
   - Scan `.html` templates for forbidden `as ` type assertions (`VUE-04`).
   - Scan `.scss` files for hardcoded hex/RGB values, physical directional properties, `@import`, or `!important` (`CSS-01`–`CSS-05`).
   - Scan `.ts` and `.vue` files for `any`, `@ts-ignore`, `@ts-nocheck`, `Math.random()`, or unguarded `window`/`document` calls at module/setup top level (`ARCH-05`, `VUE-08`, `TS-04`).
3. **Full Verification Gate (`CI-01`, `CI-02`):**
   - Execute `npm run verify` and inspect the output of `lint`, `typecheck`, `test:tokens`, `test:unit` (including V8 coverage table), `test:storybook` (`axe-core` + `play()` in light and dark themes), `build`, and `test:smoke`.
4. **Reflow & Target-Size Audit (`RESP-02`, `RESP-04`):**
   - Run automated Playwright checks at `320px × 568px` (fine and coarse pointer emulation) across all stories to confirm `scrollWidth <= clientWidth` and interactive bounding boxes meet `≥ 24×24px` (fine) and `≥ 44×44px` (coarse).

### 13.2 Scorecard Template

An implementation passes validation **only if every row below is scored `PASS`**:

| Gate ID | Category | Rule IDs Checked | Target / Threshold | Status (`PASS` / `FAIL`) | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `G-01` | Genericity & Dependencies | `META-04`, `ARCH-01` | 0 forbidden strings; 0 headless UI deps | | |
| `G-02` | Component File Split & TS | `VUE-01`–`10`, `TS-01`–`04` | 6 files/component; `vue-tsc` 0 errors; 0 `as` in `.html` | | |
| `G-03` | Token & Contrast Math | `TOK-01`–`06`, `A11Y-01`–`03`, `TEST-11` | `contrast-check.ts` 100% pass; ΔE ≥ 10 | | |
| `G-04` | CSS & Forced Colors Discipline | `CSS-01`–`08` | 0 hardcoded colors/px; logical props; `forced-colors` rules | | |
| `G-05` | Responsiveness & Touch Targets | `RESP-01`–`07` | 0 overflow at `320px`; ≥ 24px fine / ≥ 44px coarse targets | | |
| `G-06` | APG Keyboard & ARIA Contracts | `A11Y-04`–`19` | All keyboard shortcuts & ARIA states verified | | |
| `G-07` | Unit & Composable Coverage | `TEST-02`–`07`, `TEST-10` | Global ≥ 90%/85%; composables 100%/95% in real browsers | | |
| `G-08` | Storybook & Axe Gate | `SB-01`–`05`, `TEST-08`–`09` | 0 axe violations (light + dark); all `play()` tests green | | |
| `G-09` | Package Build & Smoke Test | `PKG-01`–`04`, `TEST-12` | `npm pack` installs & builds cleanly in consumer fixture | | |
| `G-10` | Manual A11y Checklist | `§7.15`, `DOD-09` | Keyboard, SR, 200% zoom, text spacing, reduced motion | | |
