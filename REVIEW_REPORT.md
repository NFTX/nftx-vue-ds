# `@nftx-dev/vue-ds` — Design System Implementation & Missing Components Review Report

- **Package:** `@nftx-dev/vue-ds` (`/workspace/Projects/design-system`)
- **Version Reviewed:** `1.0.1`
- **Normative References:** [`IMPLEMENTATION_GUIDELINES.md`](./IMPLEMENTATION_GUIDELINES.md), [`DESIGN_SYSTEM_PLAN.md`](./DESIGN_SYSTEM_PLAN.md), [`REQUESTED_COMPONENTS.md`](./REQUESTED_COMPONENTS.md)
- **Review Date:** 2026-10-21
- **Target Audience:** AI Implementation Agent (crystal-clear, self-contained specification — **do not guess; follow exact file paths, prop interfaces, token names, and test contracts below**)

---

## 1. Executive Summary

A comprehensive audit of `@nftx-dev/vue-ds` was conducted against its own normative [`IMPLEMENTATION_GUIDELINES.md`](./IMPLEMENTATION_GUIDELINES.md) (`META-*`, `ARCH-*`, `VUE-*`, `TS-*`, `TOK-*`, `CSS-*`, `RESP-*`, `A11Y-*`, `SB-*`, `TEST-*`) as well as real-world consumer friction uncovered during the **Portal** integration.

The review identified **18 implementation defects / guideline violations** in existing components and **10 missing components / primitive enhancements** required for v1.1.0:

1. **Undefined CSS Custom Properties (Critical):** 5 semantic tokens (`--ds-color-border-error`, `--ds-color-border-focus`, `--ds-color-border-hover`, `--ds-color-focus-ring-error`, `--ds-shadow-xl`) are referenced across 6 components (`DsSelect`, `DsSearchBar`, `DsCard`, `DsChipGroup`, `DsMenu`, `DsModal`) but **do not exist** in `_semantic.scss` or `_primitives.scss`.
2. **Broken Accessibility & Platform Contracts (Critical/High):**
   - `useAnnouncer.ts` updates detached in-memory `Ref<string>` variables without ever creating or updating a DOM `aria-live` region (`A11Y-19`, `TEST-07`).
   - `DsMenu` CSS Anchor Positioning references `position-anchor: --ds-menu-anchor` in `DsMenu.scss`, but `DsMenu` never sets `anchor-name` on `.ds-menu-trigger`, and `useAnchorFallback.ts` accesses `CSS.supports` at module evaluation time without an SSR `typeof CSS !== 'undefined'` guard (`ARCH-05`).
   - `DsEmptyState.html` wraps `<slot name="description">` in a `<p>` tag instead of a `<div>`, causing invalid HTML5 DOM auto-closing whenever consumers pass rich/block descriptions, and omits `aria-describedby` when `#description` slot is used without the `description` prop.
   - `DsCard` with `target="_blank"` omits `rel="noopener noreferrer"` and screen-reader `(opens in a new tab)` text, and `variant="elevated"` uses `--ds-color-bg-surface` instead of `--ds-color-bg-elevated`.
3. **Vue Attribute Inheritance & Normative Rule Violations (High/Medium):**
   - `DsSelect.vue` and `DsSwitch.vue` bind `v-bind="$attrs"` on inner controls without setting `defineOptions({ inheritAttrs: false })` (`VUE-09`), duplicating attributes on both the wrapper and control.
   - `DsBadge.scss`, `DsCard.scss`, `DsMenu.scss`, and `DsModal.scss` contain hardcoded hex/RGBA colors (`#b91c1c`, `rgba(...)`), violating `CSS-02` and breaking the Colorblind theme.
   - `DsIcon.vue` uses `import * as LucideIcons from 'lucide-vue-next'`, defeating tree-shaking and bundling all ~1,500 Lucide icons into consumer apps.
4. **Consumer Friction & Missing Primitives:**
   - Why Portal had to use `:deep()` and `!important`: `DsChipGroup` lacks `allowEmpty: false` (mandatory active filter) and `variant="elevated"`, `DsCardGrid` lacks `mode="auto-fill"` (stretching single items across 1280px screens), `DsCard` forces header/footer borders (`divided` prop missing), and atomic primitives (`DsThemeToggle`, `DsTag`, `DsCode`, `DsKbd`, `DsAlert`, `DsDivider`, `DsTooltip`) are missing.

---

## 2. Part I — Existing Implementation Defects & Normative Rule Violations

| ID | Severity | Rule Violated | File(s) | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **DS-01** | 🔴 Critical | `TOK-01`, `TOK-04`, `CSS-02` | `_semantic.scss`, `DsSelect.scss`, `DsSearchBar.scss`, `DsCard.scss`, `DsChipGroup.scss`, `DsMenu.scss`, `DsModal.scss` | 5 CSS tokens used in components are completely undefined in `_semantic.scss` (`--ds-color-border-error`, `--ds-color-border-focus`, `--ds-color-border-hover`, `--ds-color-focus-ring-error`, `--ds-shadow-xl`) |
| **DS-02** | 🔴 Critical | `A11Y-19`, `TEST-07` | `src/composables/a11y/useAnnouncer.ts` | `useAnnouncer` only mutates detached JS `Ref<string>`s and never mounts or updates a singleton DOM `aria-live` region |
| **DS-03** | 🔴 Critical | `A11Y-17`, `ARCH-05`, `CSS-03` | `DsMenu.vue`, `DsMenu.html`, `DsMenu.scss`, `useAnchorFallback.ts` | `DsMenu` never declares `anchor-name` on `.ds-menu-trigger`; `DsMenu.scss` uses physical `top/left/right/bottom`; `useAnchorFallback` calls `CSS.supports` without SSR guard; `ArrowUp` on trigger is unimplemented |
| **DS-04** | 🔴 Critical | `A11Y-08`, `CSS-02`, `CSS-08` | `DsCard.vue`, `DsCard.html`, `DsCard.scss` | Missing `rel="noopener noreferrer"` and SR warning when `target="_blank"`; `variant="elevated"` uses `--ds-color-bg-surface` instead of `--ds-color-bg-elevated`; `variant="glass"` hardcodes RGBA and ignores `colorblind` theme |
| **DS-05** | 🔴 Critical | `HTML5`, `A11Y-08` | `DsEmptyState.html`, `DsEmptyState.vue` | `#description` slot is wrapped in `<p>` (breaks when consumers pass block elements) and `aria-describedby` is `undefined` when `#description` slot is used without `description` prop |
| **DS-06** | 🟠 High | `VUE-09` | `DsSelect.vue`, `DsSwitch.vue`, `DsButton.html`, `DsBadge.html`, `DsLink.html`, `DsSpinner.html`, `DsIcon.html` | `DsSelect` and `DsSwitch` bind `v-bind="$attrs"` on child elements without `defineOptions({ inheritAttrs: false })`, duplicating attributes; 5 other components omit `$attrs` pass-through |
| **DS-07** | 🟠 High | `A11Y-12`, `RESP-04` | `DsChipGroup.vue`, `DsChipGroup.scss` | Clicking active chip in single-select mode clears `model.value` to `''` with no `allowEmpty: false` option; `target-size` forces 44px min-height directly on pill instead of pseudo-element expansion; low contrast against `--ds-color-bg-base` |
| **DS-08** | 🟠 High | `RESP-06` | `DsCardGrid.vue`, `DsCardGrid.scss` | Hardcodes `repeat(auto-fit, ...)`, stretching 1–2 cards across full 1280px width; lacks `mode?: 'auto-fit' \| 'auto-fill'` prop |
| **DS-09** | 🟠 High | `CSS-02`, `TOK-04` | `DsBadge.scss`, `DsMenu.scss`, `DsModal.scss` | Hardcoded `#b91c1c` in `DsBadge.scss:96` and `DsMenu.scss:125` and `rgba(15, 23, 42, 0.6)` in `DsModal.scss:18` |
| **DS-10** | 🟠 High | `A11Y-18` | `DsModal.vue`, `DsModal.html` | Prop is named `closeOnBackdropClick` instead of normative `dismissible` (`A11Y-18`); `Escape` key (`handleCancel`) ignores `role="alertdialog"` and `dismissible: false`, always closing the modal! |
| **DS-11** | 🟠 High | `A11Y-19`, `CSS-02` | `DsToast.html`, `DsToast.scss` | Renders single `<div popover="manual">` with hardcoded `z-index: 9999` instead of `var(--ds-z-index-toast)` and lacks `<section aria-label="Notifications">` container (`A11Y-19`) |
| **DS-12** | 🟡 Medium | `PKG-01`, Performance | `DsIcon.vue` | `import * as LucideIcons from 'lucide-vue-next'` defeats bundler tree-shaking, pulling the entire icon library into consumer bundles |
| **DS-13** | 🟡 Medium | `A11Y-11` | `DsButton.vue` | `isIconOnly` only checks `!slots.default && (!!slots.prefix \|\| !!slots.suffix)`; fails when `<DsIcon>` is placed in the default slot, and never emits a dev warning when `ariaLabel` is missing |
| **DS-14** | 🟡 Medium | `A11Y-10`, `A11Y-15` | `DsField.html`, `DsSelect.vue` | `DsField.html` hides `#hint` whenever `hasError` is true (`v-if="hint && !hasError"`), breaking `aria-describedby="hintId errorId"` (`A11Y-10`); `DsSelect` converts numeric `option.value` to `string` on change |
| **DS-15** | 🟡 Medium | `A11Y-16`, `CSS-03` | `DsTabs.html`, `DsTabs.scss` | `DsTabs.html` renders all tabpanels in DOM with `:hidden="model !== tab.id"` AND `v-if="model === tab.id"` on the slot; `DsTabs.scss` uses physical `border-top/left/right: none` (`CSS-03`) |
| **DS-16** | 🟡 Medium | `A11Y-06`, `RESP-05` | `DsSkipLink.vue`, `DsSearchBar.vue` | `DsSkipLink` calls `scrollIntoView({ behavior: 'smooth' })` unconditionally even under `prefers-reduced-motion: reduce`; `DsSearchBar` does not clear/blur on `Escape` |
| **DS-17** | 🟡 Medium | `SB-01`, `TEST-09`, `TEST-11` | `.storybook/preview.ts`, `scripts/contrast-check.ts` | Storybook `withThemeByDataAttribute` only registers `light` and `dark`, omitting `colorblind`; `contrast-check.ts` does not scan component `.scss` files for undefined `var(--ds-*)` tokens |
| **DS-18** | 🟢 Low | `PKG-01`, Hygiene | `package.json`, `IMPLEMENTATION_GUIDELINES.md`, `.vitest/` | Package name mismatch (`@nftx-dev/vue-ds` in `package.json` vs `@nftx/vue-ds` in docs); leftover `nftx-dev-vue-ds-1.0.1.tgz` and `.vitest/attachments/failure-screenshots/` in workspace |


---

### `DS-01` (Critical): 5 CSS Custom Properties Referenced in Components Are Undefined in Token Files

- **Files:**
  - `src/styles/tokens/_primitives.scss`
  - `src/styles/tokens/_semantic.scss`
  - Referenced in: `DsSelect.scss`, `DsSearchBar.scss`, `DsCard.scss`, `DsChipGroup.scss`, `DsMenu.scss`, `DsModal.scss`
- **Problem:**
  Five CSS custom properties are used across component stylesheets without being defined in `_primitives.scss` or `_semantic.scss`:
  1. `--ds-color-border-error` (`DsSelect.scss:58`)
  2. `--ds-color-border-focus` (`DsSearchBar.scss:24`, `DsSelect.scss:21`)
  3. `--ds-color-border-hover` (`DsCard.scss:126`, `DsChipGroup.scss:35`, `DsMenu.scss:29`)
  4. `--ds-color-focus-ring-error` (`DsSelect.scss:61`)
  5. `--ds-shadow-xl` (`DsModal.scss:36`)
  Because they evaluate to `initial` / `unset`, borders disappear on hover/focus/error states in `DsSelect`, `DsSearchBar`, `DsCard`, `DsChipGroup`, and `DsMenu`, and `DsModal` renders with no box-shadow.
- **Required Fix (for implementing AI):**
  1. In `src/styles/tokens/_primitives.scss`, add `--ds-shadow-xl`:
     ```scss
     --ds-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
     ```
  2. In `src/styles/tokens/_semantic.scss`, define the missing border, focus-ring, and backdrop tokens across **all theme blocks** (`:root, [data-theme='light']`, `[data-theme='dark']`, `@media (prefers-color-scheme: dark)` fallback, `[data-theme='colorblind']`, `[data-theme='slate-light']`, `[data-theme='slate-dark']`):
     ```scss
     // In :root, [data-theme='light']
     --ds-color-border-hover: var(--ds-color-neutral-400);
     --ds-color-border-focus: var(--ds-color-primary-600);
     --ds-color-border-error: var(--ds-color-red-600);
     --ds-color-focus-ring-error: var(--ds-color-red-600);
     --ds-color-bg-backdrop: rgb(15 23 42 / 0.6);

     // In [data-theme='dark'] (and dark media query)
     --ds-color-border-hover: var(--ds-color-neutral-500);
     --ds-color-border-focus: var(--ds-color-primary-500);
     --ds-color-border-error: var(--ds-color-red-500);
     --ds-color-focus-ring-error: var(--ds-color-red-500);
     --ds-color-bg-backdrop: rgb(0 0 0 / 0.75);

     // In [data-theme='colorblind']
     --ds-color-border-hover: var(--ds-color-neutral-500);
     --ds-color-border-focus: var(--ds-color-cb-sky);
     --ds-color-border-error: var(--ds-color-cb-vermilion);
     --ds-color-focus-ring-error: var(--ds-color-cb-vermilion);
     --ds-color-bg-backdrop: rgb(0 0 0 / 0.75);
     ```

---

### `DS-02` (Critical): `useAnnouncer` Mutates Detached `Ref`s Without Mounting a DOM `aria-live` Region

- **File:** `src/composables/a11y/useAnnouncer.ts`
- **Rule Violated:** `A11Y-19`, `TEST-07`
- **Problem:**
  `useAnnouncer()` only updates two module-scoped `ref('')` variables (`politeMessage` and `assertiveMessage`). Nothing in the design system mounts these refs into a DOM `<div aria-live="polite">` or `<div aria-live="assertive">` element. Assistive technologies never receive announcements from `useAnnouncer().announce(...)`.
- **Required Fix (for implementing AI):**
  Update `src/composables/a11y/useAnnouncer.ts` to lazily create (and reuse as a singleton) two visually-hidden live region `<div>` elements in `document.body` when running in a browser (`typeof document !== 'undefined'`):
  ```ts
  function ensureLiveRegion(politeness: AnnouncerPoliteness): HTMLElement | null {
    if (typeof document === 'undefined') return null
    const id = `ds-announcer-${politeness}`
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('div')
      el.id = id
      el.setAttribute('aria-live', politeness)
      el.setAttribute('aria-atomic', 'true')
      if (politeness === 'assertive') el.setAttribute('role', 'alert')
      else el.setAttribute('role', 'status')
      Object.assign(el.style, {
        position: 'fixed',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      })
      document.body.appendChild(el)
    }
    return el
  }
  ```
  Inside `announce(message, politeness = 'polite')`:
  1. Clear both the `ref` and the live region element's `textContent = ''`.
  2. Inside the `setTimeout(..., 50)` callback, set both the `ref.value = message` and `el.textContent = message`.
  3. Add unit assertions in `useAnnouncer.spec.ts` verifying `document.getElementById('ds-announcer-polite')?.textContent` updates.

---

### `DS-03` (Critical): `DsMenu` & `useAnchorFallback` Broken Anchor Positioning, SSR Hazard, and Missing `ArrowUp`

- **Files:**
  - `src/components/DsMenu/DsMenu.vue`
  - `src/components/DsMenu/DsMenu.html`
  - `src/components/DsMenu/DsMenu.scss`
  - `src/composables/a11y/useAnchorFallback.ts`
- **Rules Violated:** `A11Y-17`, `ARCH-05`, `CSS-03`
- **Problems:**
  1. `DsMenu.scss` sets `position-anchor: --ds-menu-anchor` inside `@supports (anchor-name: --a)`, but `.ds-menu-trigger` never declares `anchor-name: --ds-menu-anchor`! Moreover, a static `--ds-menu-anchor` name collides when two `DsMenu` instances exist on the same page.
  2. `useAnchorFallback.ts:18` executes `const supportsCssAnchor = CSS.supports?.('anchor-name: --a') ?? false` unconditionally during setup without checking `typeof CSS !== 'undefined'`, throwing `ReferenceError: CSS is not defined` during SSR (`ARCH-05`).
  3. `DsMenu.scss:64-83` uses physical `top`, `bottom`, `left`, `right` properties instead of CSS Logical Properties (`inset-block-start`, `inset-block-end`, `inset-inline-start`, `inset-inline-end`), violating `CSS-03`.
  4. `DsMenu.vue` `handleTriggerKeydown` handles `ArrowDown`, `Enter`, and ` ` (Space), which open the menu and focus the **first** item, but omits `ArrowUp`, which `A11Y-17` requires to open the menu and focus the **last** enabled `menuitem`.
- **Required Fix (for implementing AI):**
  1. In `useAnchorFallback.ts`, guard `CSS.supports`:
     ```ts
     const supportsCssAnchor = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
       ? CSS.supports('anchor-name: --a')
       : false
     ```
  2. In `DsMenu.vue` / `DsMenu.html`, bind a unique dynamic CSS custom property `--ds-menu-anchor-name: --ds-anchor-${menuId}` on `.ds-menu-wrapper`, and in `DsMenu.scss` set `anchor-name: var(--ds-menu-anchor-name)` on `.ds-menu-trigger` and `position-anchor: var(--ds-menu-anchor-name)` on `.ds-menu`.
  3. In `DsMenu.scss`, replace physical `top`/`bottom`/`left`/`right` with `inset-block-start`, `inset-block-end`, `inset-inline-start`, `inset-inline-end`.
  4. In `DsMenu.vue` `handleTriggerKeydown`, handle `event.key === 'ArrowUp'` by opening the menu and setting `activeIndex.value = enabledIndices.length - 1`.

---

### `DS-04` (Critical): `DsCard` Missing `target="_blank"` Security/A11y, Broken `elevated` Surface Token, and Hardcoded `glass` RGBA

- **Files:**
  - `src/components/DsCard/DsCard.vue`
  - `src/components/DsCard/DsCard.html`
  - `src/components/DsCard/DsCard.scss`
- **Rules Violated:** `A11Y-08`, `CSS-02`, `CSS-08`
- **Problems:**
  1. When `DsCard` renders as an `<a>` (`v-if="href"`) with `target="_blank"`, `DsCard.html` omits `rel="noopener noreferrer"` (tabnabbing vulnerability) and omits a visually hidden `(opens in a new tab)` screen-reader announcement (compare `DsLink.html`, which implements both).
  2. In `DsCard.scss:26-29`, `.ds-card--elevated` sets `border-color: transparent` and inherits `background-color: var(--ds-color-bg-surface)` instead of `var(--ds-color-bg-elevated)`. In dark and colorblind themes where `box-shadow` is subtle against dark backgrounds, elevated cards lose their visual boundary.
  3. In `DsCard.scss:36-47`, `.ds-card--glass` hardcodes `rgba(255, 255, 255, 0.7)`, `rgba(255, 255, 255, 0.2)`, `rgba(30, 41, 59, 0.7)`, and `rgba(255, 255, 255, 0.1)` (violating `CSS-02`) and only checks `[data-theme='dark']`, ignoring `colorblind` and `slate-dark`.
- **Required Fix (for implementing AI):**
  1. In `DsCard.html`, update the `<a v-if="href">` branch:
     ```html
     <a
       v-if="href"
       :href="href"
       :target="target"
       :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
       class="ds-card"
       :class="classes"
     >
       <!-- header, default, footer slots -->
       <DsVisuallyHidden v-if="target === '_blank'"> (opens in a new tab)</DsVisuallyHidden>
     </a>
     ```
  2. In `DsCard.scss`, update `&--elevated` to use `background-color: var(--ds-color-bg-elevated); border-color: var(--ds-color-border-subtle); box-shadow: var(--ds-shadow-md);`.
  3. Move glass background/border colors to semantic tokens (`--ds-color-bg-glass`, `--ds-color-border-glass`) in `_semantic.scss` across all themes.

---

### `DS-05` (Critical): `DsEmptyState` Invalid `<p>` Wrapper Around `#description` Slot & Missing `aria-describedby`

- **Files:**
  - `src/components/DsEmptyState/DsEmptyState.html`
  - `src/components/DsEmptyState/DsEmptyState.vue`
- **Problems:**
  1. `DsEmptyState.html:24-26` renders:
     ```html
     <p v-if="description || $slots.description" :id="descId" class="ds-empty-state__description">
       <slot name="description">{{ description }}</slot>
     </p>
     ```
     In HTML5, `<p>` cannot contain block-level elements (`<div>`, `<ul>`, `<p>`). When a consumer passes rich content into `#description` (such as troubleshooting steps in Portal's `FallbackError`), the browser prematurely closes `<p>`, ejecting the slotted content outside `.ds-empty-state__description` and outside `#descId`.
  2. `DsEmptyState.html:6` binds `:aria-describedby="description ? descId : undefined"`. When a consumer uses `<template #description>` without passing the `description` string prop, `aria-describedby` is `undefined` even though `:id="descId"` is rendered in the DOM!
- **Required Fix (for implementing AI):**
  1. In `DsEmptyState.html`, change `<p v-if="description || $slots.description" :id="descId" class="ds-empty-state__description">` to a `<div ...>`.
  2. Bind `:aria-describedby="description || $slots.description ? descId : undefined"` on the root `.ds-empty-state` element.

---

### `DS-06` (High): `VUE-09` Attribute Pass-Through Violations Across 7 Components

- **Files:** `DsSelect.vue`, `DsSwitch.vue`, `DsButton.html`, `DsBadge.html`, `DsLink.html`, `DsSpinner.html`, `DsIcon.html`
- **Rule Violated:** `VUE-09` (*"Components must support standard HTML attribute pass-through (`inheritAttrs: false` with explicit `v-bind="$attrs"` on the primary interactive element when wrapped)"*)
- **Problems:**
  1. `DsSelect.html:17` (`<select v-bind="$attrs">`) and `DsSwitch.html:12` (`<input type="checkbox" role="switch" v-bind="$attrs">`) bind `$attrs` on a nested child element, **but neither `DsSelect.vue` nor `DsSwitch.vue` calls `defineOptions({ inheritAttrs: false })`**. As a result, any attribute passed by a consumer (including `data-testid`, `aria-*`, or event listeners) is duplicated onto both the outer `<div>`/`<label>` wrapper AND the inner `<select>`/`<input>`.
  2. `DsInput.vue`, `DsTextarea.vue`, and `DsCheckbox.vue` set `defineOptions({ inheritAttrs: false })` and bind `v-bind="$attrs"` on the inner `<input>`/`<textarea>`, which strips consumer `class` and `style` from the root wrapper unless explicitly forwarded or handled.
- **Required Fix (for implementing AI):**
  1. Add `defineOptions({ inheritAttrs: false })` to `DsSelect.vue` and `DsSwitch.vue` immediately after `import` statements.
  2. Ensure all single-root primitives (`DsButton`, `DsBadge`, `DsLink`, `DsSpinner`, `DsIcon`) preserve root attribute inheritance and test `data-testid` and `aria-*` forwarding in unit specs.

---

### `DS-07` (High): `DsChipGroup` Mandatory Selection (`allowEmpty`), Touch Target Sizing, and Surface Contrast

- **Files:**
  - `src/components/DsChipGroup/DsChipGroup.vue`
  - `src/components/DsChipGroup/DsChipGroup.html`
  - `src/components/DsChipGroup/DsChipGroup.scss`
- **Rules Violated:** `A11Y-12`, `RESP-04`
- **Problems:**
  1. In single-select mode (`multiple: false`), clicking the already-selected chip executes `model.value = current === chipValue ? '' : chipValue` (`DsChipGroup.vue:56`). Filter bars with an explicit `"All"` chip (like Portal's category filter) must never enter an empty `''` selection state, which forced Portal to add a `watch` hack to revert empty values.
  2. `DsChipGroup.scss:12` applies `@include ts.target-size;` (`min-width: 2.75rem; min-height: 2.75rem` on coarse pointers) directly to `.ds-chip`, inflating compact filter pills into tall 44px blocks instead of using `@include ts.target-size-pseudo;` (`RESP-04`).
  3. `.ds-chip` uses `background-color: var(--ds-color-bg-surface)` which blends into page backgrounds that also use `--ds-color-bg-surface`.
- **Required Fix (for implementing AI):**
  See detailed enhancement contract in **`ENH-06`** (Part II below): add `allowEmpty?: boolean` (default `true`), `variant?: 'surface' | 'elevated'` (default `'elevated'`), `scrollable?: boolean` (default `false`), and switch `.ds-chip` to `@include ts.target-size-pseudo`.

---

### `DS-08` (High): `DsCardGrid` Hardcodes `auto-fit`, Stretching 1–2 Cards to Full Container Width

- **Files:**
  - `src/components/DsCardGrid/DsCardGrid.vue`
  - `src/components/DsCardGrid/DsCardGrid.scss`
- **Rule Violated:** `RESP-06`
- **Problem:**
  `DsCardGrid.scss:8` hardcodes `grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--ds-grid-min-width, 18rem)), 1fr));`. When a consumer filters a list down to 1 or 2 cards on a desktop viewport (`1280px`), `auto-fit` collapses empty tracks and stretches a single card across the entire `1280px` row.
- **Required Fix (for implementing AI):**
  See **`ENH-07`** (Part II below): add prop `mode?: 'auto-fit' | 'auto-fill'` (defaulting to `'auto-fill'` or configurable via `--ds-grid-mode`) so single cards maintain a consistent column width.

---

### `DS-09` (High): Hardcoded Hex and RGBA Colors in `DsBadge`, `DsMenu`, and `DsModal`

- **Files:**
  - `src/components/DsBadge/DsBadge.scss` (line 96)
  - `src/components/DsMenu/DsMenu.scss` (line 125)
  - `src/components/DsModal/DsModal.scss` (line 18)
- **Rules Violated:** `CSS-02`, `TOK-04`
- **Problem:**
  - `DsBadge.scss:96` (`.ds-badge__remove:hover`) and `DsMenu.scss:125` (`.ds-menu-item--danger`) hardcode `color: #b91c1c;`. In dark mode (`#1e293b` surface), `#b91c1c` achieves only **2.84:1** contrast (failing WCAG AA 4.5:1) and ignores the Okabe-Ito vermilion token in `[data-theme='colorblind']`.
  - `DsModal.scss:18` (`&::backdrop`) hardcodes `background-color: rgba(15, 23, 42, 0.6);`.
- **Required Fix (for implementing AI):**
  - Replace `color: #b91c1c;` in `DsBadge.scss:96` and `DsMenu.scss:125` with `color: var(--ds-color-text-error);`.
  - Replace `background-color: rgba(15, 23, 42, 0.6);` in `DsModal.scss:18` with `background-color: var(--ds-color-bg-backdrop);`.


---

### `DS-10` (High): `DsModal` Violates `A11Y-18` & `TEST-10` on `Escape` and `alertdialog` Dismissibility

- **Files:**
  - `src/components/DsModal/DsModal.vue`
  - `src/components/DsModal/DsModal.html`
- **Rules Violated:** `A11Y-18`, `TEST-10`
- **Problems:**
  1. `A11Y-18` specifies: *"A `dismissible` prop (default `true` for `dialog`, `false` for `alertdialog`) controls whether backdrop click and `Escape` close the modal."* Instead, `DsModal.vue` defines `closeOnBackdropClick?: boolean` and omits `dismissible?: boolean`.
  2. In `DsModal.vue:60-63`, `handleCancel` (triggered by native `<dialog>` `cancel` event when pressing `Escape`) unconditionally calls `handleClose()`:
     ```ts
     function handleCancel(event: Event) {
       event.preventDefault()
       handleClose() // BUG: Ignores dismissible / alertdialog!
     }
     ```
     Pressing `Escape` on a non-dismissible `alertdialog` closes it, violating `A11Y-18` and `TEST-10`.
- **Required Fix (for implementing AI):**
  1. Add `dismissible?: boolean` to `DsModalProps` (keep `closeOnBackdropClick?: boolean` as a deprecated alias for backwards compatibility).
  2. Compute `isDismissible`:
     ```ts
     const isDismissible = computed(() => {
       if (props.dismissible !== undefined) return props.dismissible
       if (props.closeOnBackdropClick !== undefined) return props.closeOnBackdropClick
       return props.role !== 'alertdialog'
     })
     ```
  3. In `handleCancel(event: Event)`:
     ```ts
     function handleCancel(event: Event) {
       event.preventDefault()
       if (isDismissible.value) {
         handleClose()
       }
     }
     ```
  4. Hide the default header close `<DsButton>` in `DsModal.html` when `!isDismissible`.

---

### `DS-11` (High): `DsToast` Hardcodes `z-index: 9999` and Lacks Notification Region Semantics

- **Files:**
  - `src/components/DsToast/DsToast.html`
  - `src/components/DsToast/DsToast.scss`
- **Rules Violated:** `A11Y-19`, `CSS-02`
- **Problems:**
  1. `DsToast.scss:8` hardcodes `z-index: 9999;` instead of using the primitive token `var(--ds-z-index-toast)` (`800` in `_primitives.scss`).
  2. `A11Y-19` requires toasts to reside inside a `<section aria-label="Notifications">` landmark region.
- **Required Fix (for implementing AI):**
  1. In `DsToast.scss:8`, replace `z-index: 9999;` with `z-index: var(--ds-z-index-toast);`.
  2. In `DsToast.html`, change the outer `<div ref="toastRef" popover="manual" ...>` to `<section ref="toastRef" aria-label="Notification" popover="manual" ...>` (or provide a `<DsToaster>` stack container with `<section aria-label="Notifications">`).

---

### `DS-12` (Medium): `DsIcon` Uses `import * as LucideIcons`, Defeating Bundler Tree-Shaking

- **File:** `src/components/DsIcon/DsIcon.vue`
- **Rule Violated:** `PKG-01` (Tree-shakable ESM build)
- **Problem:**
  `DsIcon.vue:2` executes `import * as LucideIcons from 'lucide-vue-next'` to dynamically resolve arbitrary string icon names at runtime. Even though `lucide-vue-next` is externalized in `@nftx-dev/vue-ds`'s Vite build, any consumer bundler (Vite/Rollup/Webpack) that processes `@nftx-dev/vue-ds/dist/vue-ds.js` sees a namespace import `import * as LucideIcons` and is forced to bundle **all ~1,500 Lucide icons** (~500+ KB minified) into the consumer application.
- **Required Fix (for implementing AI):**
  1. Allow `name` prop on `DsIcon` to accept **either** a string `string` **or** a Vue `Component` (`name: string | Component`):
     ```ts
     export interface DsIconProps {
       name: string | Component
       size?: DsIconSize
       decorative?: boolean
       ariaLabel?: string
     }
     ```
  2. Provide a curated internal map of the ~30 core icons used by DS components (`Search`, `X`, `Check`, `ChevronDown`, `AlertCircle`, `AlertTriangle`, `Info`, `CheckCircle2`, `Sun`, `Moon`, `Eye`, `ExternalLink`, `Terminal`, `Copy`, `Folder`, `Sparkles`, etc.) using named imports from `lucide-vue-next`, plus an optional app-level icon registration helper `registerDsIcons(icons: Record<string, Component>)` so consumers never pay the full `import *` bundle cost.

---

### `DS-13` (Medium): `DsButton` `isIconOnly` Detection & Missing Dev Warning (`A11Y-11`)

- **File:** `src/components/DsButton/DsButton.vue`
- **Rule Violated:** `A11Y-11`
- **Problem:**
  `A11Y-11` states: *"Icon-only buttons must require an `ariaLabel` prop and emit a runtime console warning in development if omitted."*
  In `DsButton.vue:46-48`:
  ```ts
  const isIconOnly = computed(() => {
    return !slots.default && (!!slots.prefix || !!slots.suffix)
  })
  ```
  1. If a consumer passes `<DsButton aria-label="Theme"><DsIcon name="Sun" /></DsButton>` via the default slot, `isIconOnly` evaluates to `false` (so `.ds-button--icon-only` square padding is not applied).
  2. No `console.warn` is ever emitted in development when `isIconOnly.value && !props.ariaLabel`.
- **Required Fix (for implementing AI):**
  1. Add an explicit `iconOnly?: boolean` prop to `DsButtonProps` (auto-detected when `!slots.default && (!!slots.prefix || !!slots.suffix)` OR when `props.iconOnly` is `true`).
  2. Add a `watchEffect` guarded by `import.meta.env.DEV`:
     ```ts
     if (import.meta.env.DEV) {
       watchEffect(() => {
         if (isIconOnly.value && !props.ariaLabel) {
           console.warn('[DsButton] Icon-only buttons require an `ariaLabel` prop (A11Y-11).')
         }
       })
     }
     ```

---

### `DS-14` (Medium): `DsField` Dangling `aria-describedby` When `error` Is Present & `DsSelect` Number Coercion

- **Files:**
  - `src/components/DsField/DsField.html`
  - `src/components/DsField/DsField.vue`
  - `src/components/DsSelect/DsSelect.vue`
- **Rules Violated:** `A11Y-10`, `A11Y-15`
- **Problems:**
  1. In `DsField.vue:60-64`, `describedBy` includes **both** `hintId` and `errorId` when both `hint` and `error` props are passed (`aria-describedby="ds-field-1-hint ds-field-1-error"`). However, `DsField.html:25` uses `v-if="hint && !hasError"`, which removes `#ds-field-1-hint` from the DOM whenever an error is shown! This creates a broken ARIA ID reference and violates `A11Y-10`.
  2. In `DsSelect.vue:96-99`, `handleChange` assigns `model.value = target.value`. Because `HTMLSelectElement.value` is always a `string`, passing numeric option values (`{ label: 'Ten', value: 10 }`) silently mutates `v-model` from `number` (`10`) to `string` (`'10'`).
- **Required Fix (for implementing AI):**
  1. In `DsField.html:25`, change `v-if="hint && !hasError"` to `v-if="hint || $slots.hint"` so hint text remains in the DOM alongside the error message, and update `DsField.vue` `describedBy` to check `(props.hint || slots.hint)` and `(props.error || slots.error)`.
  2. In `DsSelect.vue` `handleChange`:
     ```ts
     function handleChange(event: Event) {
       const target = event.target as HTMLSelectElement
       const matched = props.options.find((opt) => String(opt.value) === target.value)
       model.value = matched ? matched.value : target.value
     }
     ```

---

### `DS-15` (Medium): `DsTabs` Physical Border Properties (`CSS-03`)

- **File:** `src/components/DsTabs/DsTabs.scss`
- **Rule Violated:** `CSS-03`
- **Problem:**
  `DsTabs.scss:65-67` uses physical properties:
  ```scss
  border-top: none;
  border-left: none;
  border-right: none;
  ```
- **Required Fix (for implementing AI):**
  Replace lines 65–67 of `DsTabs.scss` with logical properties:
  ```scss
  border-block-start: none;
  border-inline: none;
  ```

---

### `DS-16` (Medium): `DsSkipLink` Ignores `prefers-reduced-motion` & `DsSearchBar` Lacks `Escape` Key Clear

- **Files:**
  - `src/components/DsSkipLink/DsSkipLink.vue`
  - `src/components/DsSearchBar/DsSearchBar.vue`
  - `src/components/DsSearchBar/DsSearchBar.html`
- **Rules Violated:** `A11Y-06`, `RESP-05`
- **Problems:**
  1. `DsSkipLink.vue:54` calls `targetEl.scrollIntoView({ behavior: 'smooth' })` unconditionally in JS, bypassing CSS `@media (prefers-reduced-motion: reduce)` (`A11Y-06`, `RESP-05`).
  2. `DsSearchBar` renders `<input type="search">` with `appearance: none` (hiding the browser's native clear button in `DsSearchBar.scss:50-54`), and does not handle the `Escape` key to clear the query.
- **Required Fix (for implementing AI):**
  1. In `DsSkipLink.vue:54`:
     ```ts
     const prefersReducedMotion =
       typeof window !== 'undefined' &&
       window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
     targetEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
     ```
  2. In `DsSearchBar.html` / `DsSearchBar.vue`, add `@keydown.esc="handleEscape"` on the `<input>` that calls `handleClear()` when `model` is non-empty.

---

### `DS-17` (Medium): Storybook Missing `colorblind` Theme & Token Audit Script Missing Component SCSS Verification

- **Files:**
  - `.storybook/preview.ts`
  - `scripts/contrast-check.ts`
- **Rules Violated:** `SB-01`, `TEST-09`, `TEST-11`
- **Problems:**
  1. `.storybook/preview.ts:27-34` configures `withThemeByDataAttribute` with only `light: 'light'` and `dark: 'dark'`, omitting `colorblind: 'colorblind'`, `slateLight: 'slate-light'`, and `slateDark: 'slate-dark'` (`SB-01`).
  2. `scripts/contrast-check.ts` verifies token pairs in `_semantic.scss`, but does not scan `src/components/**/*.scss` for `var(--ds-*)` references that are missing from `_primitives.scss` and `_semantic.scss` (which allowed `DS-01` to slip through CI).
- **Required Fix (for implementing AI):**
  1. In `.storybook/preview.ts`:
     ```ts
     themes: {
       light: 'light',
       dark: 'dark',
       colorblind: 'colorblind',
       'slate-light': 'slate-light',
       'slate-dark': 'slate-dark',
     },
     ```
  2. Extend `scripts/contrast-check.ts` (or add a check inside it) that collects all `--ds-[a-z0-9-]+` definitions from `src/styles/tokens/*.scss` and verifies that every `var(--ds-[a-z0-9-]+)` used in `src/components/**/*.scss` (excluding component-local `--ds-grid-*` / `--ds-menu-anchor-*` variables) is defined.

---

### `DS-18` (Low): Package Name Discrepancy in Docs & Leftover Build/Test Artifacts

- **Files:**
  - `IMPLEMENTATION_GUIDELINES.md`, `DESIGN_SYSTEM_PLAN.md`
  - `nftx-dev-vue-ds-1.0.1.tgz`, `.vitest/attachments/failure-screenshots/`
- **Problems:**
  1. `package.json` publishes as `@nftx-dev/vue-ds`, whereas `IMPLEMENTATION_GUIDELINES.md` and `DESIGN_SYSTEM_PLAN.md` refer to `@nftx/vue-ds`.
  2. Untracked `nftx-dev-vue-ds-1.0.1.tgz` and `.vitest/` failure screenshots exist in the repository root.
- **Required Fix (for implementing AI):**
  1. Update `IMPLEMENTATION_GUIDELINES.md` and `DESIGN_SYSTEM_PLAN.md` to reference `@nftx-dev/vue-ds`.
  2. Delete `nftx-dev-vue-ds-1.0.1.tgz` and add `*.tgz` and `.vitest/` to `.gitignore`.


---

## 3. Part II — Missing Components & Primitive Enhancements Specification (v1.1.0 Roadmap)

All new components and enhancements **must** strictly follow `IMPLEMENTATION_GUIDELINES.md`:
- **3-File Split (`ARCH-01`, `ARCH-02`):** `DsName.vue` (`<script setup lang="ts">`), `DsName.html`, `DsName.scss` (`<style lang="scss" src="./DsName.scss" scoped></style>`).
- **Exports:** Re-export every new component, composable, and TypeScript interface from `src/index.ts`.
- **Stories & Tests:** Every new component must include `DsName.stories.ts` (`SB-01`–`SB-04`) and `DsName.spec.ts` (`TEST-01`–`TEST-10`, including `axe-core` assertions).

| ID | Priority | Type | Target Component / Composable | Summary |
| :--- | :--- | :--- | :--- | :--- |
| **ENH-01** | 🔴 P1 | New Component + Composable | `DsThemeToggle` + `useTheme` | 3-way (`light` → `dark` → `colorblind`) theme switcher + reactive `data-theme` / `localStorage` composable |
| **ENH-02** | 🔴 P1 | New Component (or `DsBadge` enhancement) | `DsTag` & `DsBadge` | Low-emphasis metadata pill (`subtle` / `ghost` / `outline` variants, `rounded` / `pill` shapes, prefix icon support) |
| **ENH-03** | 🔴 P1 | New Primitives | `DsCode` & `DsKbd` | Inline monospace command/path badge (with optional click-to-copy) and keyboard shortcut `<kbd>` primitive |
| **ENH-04** | 🔴 P1 | New Component | `DsAlert` | Static inline callout/banner (`info`, `success`, `warning`, `error`) with icon, title, description, and actions slots |
| **ENH-05** | 🔴 P1 | Component Enhancement | `DsCard` | Add `divided?: boolean`, `interactive?: boolean`, `accent?: boolean \| DsCardAccent`, and hover/focus elevation |
| **ENH-06** | 🔴 P1 | Component Enhancement | `DsChipGroup` | Add `allowEmpty?: boolean`, `variant?: 'surface' \| 'elevated'`, `scrollable?: boolean`, and fix touch target sizing |
| **ENH-07** | 🔴 P1 | Component Enhancement | `DsCardGrid` | Add `mode?: 'auto-fit' \| 'auto-fill'` (default `'auto-fill'`) so 1–2 cards do not stretch across full viewport width |
| **ENH-08** | 🟡 P2 | New Component | `DsDivider` | Horizontal/vertical separator (`solid` / `dashed`) with optional centered/inline label or icon |
| **ENH-09** | 🟡 P2 | New Component | `DsTooltip` | WCAG 2.2 SC 1.4.13 compliant tooltip using Popover API + CSS Anchor Positioning (`DESIGN_SYSTEM_PLAN.md` §6) |
| **ENH-10** | 🟢 P3 | New Component | `DsFooterBar` | Semantic `<footer>` landmark with `start`, `center`, and `end` slots |

---

### `ENH-01` (P1): `useTheme` Composable & `DsThemeToggle` Component

#### 1. `src/composables/useTheme.ts`
- **Purpose:** Centralize theme state management (`light`, `dark`, `colorblind`, plus optional `slate-light`, `slate-dark`) with SSR safety (`ARCH-05`), `localStorage` persistence, `prefers-color-scheme` fallback, and `document.documentElement.setAttribute('data-theme', ...)` synchronization.
- **TypeScript Contract:**
  ```ts
  export type DsTheme = 'light' | 'dark' | 'colorblind' | 'slate-light' | 'slate-dark'

  export interface UseThemeOptions {
    storageKey?: string // default: 'ds-theme'
    themes?: readonly DsTheme[] // default: ['light', 'dark', 'colorblind']
    defaultTheme?: DsTheme
  }

  export interface UseThemeReturn {
    theme: Ref<DsTheme>
    themes: readonly DsTheme[]
    setTheme: (next: DsTheme) => void
    cycleTheme: () => void
  }
  ```

#### 2. `src/components/DsThemeToggle/` (`DsThemeToggle.vue`, `.html`, `.scss`)
- **Props & Model Contract:**
  ```ts
  export interface DsThemeToggleProps {
    size?: 'sm' | 'md' | 'lg'
    variant?: 'ghost' | 'secondary' | 'outline'
    themes?: readonly DsTheme[] // default: ['light', 'dark', 'colorblind']
    storageKey?: string // default: 'ds-theme'
    showLabel?: boolean // default: false
    labels?: Partial<Record<DsTheme, string>>
  }
  ```
- **Icon & Accessibility Contract (`A11Y-11`, `A11Y-19`):**
  - Renders `DsButton` (`variant="ghost"`, `iconOnly="!showLabel"`).
  - Displays the icon representing the **currently active theme**:
    - `light` → `Sun`
    - `dark` → `Moon`
    - `colorblind` → `Eye`
  - Computes a descriptive `aria-label` announcing both current and next state: e.g. `"Current theme: Light. Activate to switch to Dark theme"`.
  - Calls `useAnnouncer().announce(\`Theme changed to \${currentLabel}\`, 'polite')` on click.

---

### `ENH-02` (P1): `DsTag` Component (and `DsBadge` `subtle` / `shape` Enhancements)

- **Why Needed:** `DsBadge` uses high-saturation semantic fills with uppercase `letter-spacing: 0.025em` meant for status indicators (`Active`, `Error`). Applications also need low-visual-weight metadata tags (technology stacks, topics, categories) that don't compete with primary CTAs.
- **Files:** `src/components/DsTag/DsTag.vue`, `DsTag.html`, `DsTag.scss`
- **Props Contract:**
  ```ts
  export type DsTagVariant = 'subtle' | 'surface' | 'outline' | 'ghost'
  export type DsTagSize = 'sm' | 'md'
  export type DsTagShape = 'rounded' | 'pill'

  export interface DsTagProps {
    variant?: DsTagVariant // default: 'subtle'
    size?: DsTagSize // default: 'sm'
    shape?: DsTagShape // default: 'rounded' (uses --ds-radius-md)
    icon?: string | Component
  }
  ```
- **Styling Contract (`DsTag.scss`):**
  - `font-family: var(--ds-font-sans); font-weight: var(--ds-font-weight-medium);` (no `text-transform: uppercase`).
  - `size="sm"`: `padding-block: var(--ds-space-1); padding-inline: var(--ds-space-2); font-size: var(--ds-font-size-xs); gap: var(--ds-space-1);`
  - `variant="subtle"`: `background-color: var(--ds-color-bg-muted); color: var(--ds-color-text-secondary); border: 1px solid var(--ds-color-border-subtle);`
  - `variant="surface"`: `background-color: var(--ds-color-bg-surface); color: var(--ds-color-text-secondary); border: 1px solid var(--ds-color-border-default);`

---

### `ENH-03` (P1): `DsCode` & `DsKbd` Typography Primitives

#### 1. `src/components/DsCode/` (`DsCode.vue`, `.html`, `.scss`)
- **Purpose:** Styled inline `<code>` or block `<pre><code>` for shell commands (`./setup-docker.sh`), file paths, and snippets, with optional one-click clipboard copy.
- **Props Contract:**
  ```ts
  export interface DsCodeProps {
    block?: boolean // default: false (renders <code> vs <pre><code>)
    copyable?: boolean // default: false
    copyText?: string // optional override for copied string
    size?: 'xs' | 'sm' | 'md' // default: 'xs'
  }
  ```
- **Styling & A11y Contract:**
  - Uses `font-family: var(--ds-font-mono); background-color: var(--ds-color-bg-muted); color: var(--ds-color-text-primary); border: 1px solid var(--ds-color-border-subtle); border-radius: var(--ds-radius-sm); padding-block: 0.125rem; padding-inline: var(--ds-space-2);`.
  - When `copyable: true`, renders an accessible copy button (`aria-label="Copy code to clipboard"`) that copies the text via `navigator.clipboard.writeText`, swaps icon from `Copy` to `Check` for 2000ms, and announces `"Copied to clipboard"` via `useAnnouncer()`.

#### 2. `src/components/DsKbd/` (`DsKbd.vue`, `.html`, `.scss`)
- **Purpose:** Semantic `<kbd>` element for keyboard shortcuts (`⌘K`, `Ctrl`, `Esc`).
- **Props Contract:**
  ```ts
  export interface DsKbdProps {
    size?: 'sm' | 'md' // default: 'sm'
  }
  ```
- **Styling Contract:**
  - `font-family: var(--ds-font-mono); font-size: var(--ds-font-size-xs); background-color: var(--ds-color-bg-elevated); color: var(--ds-color-text-secondary); border: 1px solid var(--ds-color-border-default); border-block-end-width: 2px; border-radius: var(--ds-radius-sm); padding-block: 0.125rem; padding-inline: var(--ds-space-1);`

---

### `ENH-04` (P1): `DsAlert` Inline Banner / Callout Component

- **Why Needed:** Currently `@nftx-dev/vue-ds` only has `DsToast` (transient popovers) and `DsEmptyState` (centered empty views). Consumers need a static inline callout for error troubleshooting boxes (such as Portal's `FallbackError` remediation checklist), warnings, and contextual notices.
- **Files:** `src/components/DsAlert/DsAlert.vue`, `DsAlert.html`, `DsAlert.scss`
- **Props & Slots Contract:**
  ```ts
  export type DsAlertVariant = 'info' | 'success' | 'warning' | 'error'

  export interface DsAlertProps {
    variant?: DsAlertVariant // default: 'info'
    title?: string
    icon?: string | Component
    dismissible?: boolean // default: false
  }
  ```
  - **Slots:** `default` (body content — supports block elements like `<ul>`, `<p>`, `<DsCode>`), `title`, `icon`, `actions`.
  - **Emits:** `dismiss: []`.
  - **ARIA Contract:** Uses `role="alert"` when `variant === 'error' || variant === 'warning'`, and `role="status"` (or `<aside>`) when `variant === 'info' || variant === 'success'`.

---

### `ENH-05` (P1): `DsCard` Enhancements (`divided`, `interactive`, `accent`)

- **Files:** `src/components/DsCard/DsCard.vue`, `DsCard.html`, `DsCard.scss`
- **New Props Contract:**
  ```ts
  export interface DsCardProps {
    variant?: DsCardVariant
    padding?: DsCardPadding
    href?: string
    target?: string
    /** Whether to render 1px solid borders between header, body, and footer. Default: true */
    divided?: boolean
    /** Applies hover/focus-within elevation and border transitions even when card is a <article>/<div> container with internal links. Default: false */
    interactive?: boolean
    /** Renders a top accent bar on hover/focus-within or permanently. Default: false */
    accent?: boolean | 'primary' | 'Hover'
  }
  ```
- **Why Needed:** Portal had to write `:deep(.ds-card__header) { border-block-end: none; }` and custom `::before` pseudo-elements because `DsCard` forced internal dividers and lacked an `interactive` container mode when the card wasn't a single `<a>` tag.
- **Required Changes:**
  1. When `divided: false`, omit `border-block-end` on `.ds-card__header` and `border-block-start` on `.ds-card__footer`, and increase internal flex `gap` between header, body, and footer to `var(--ds-space-4)`.
  2. When `interactive: true` (or `Boolean(props.href)`), apply hover/focus-within elevation (`transform: translateY(-2px)` guarded by `@include rm.reduced-motion`, `box-shadow: var(--ds-shadow-lg)`, `border-color: var(--ds-color-border-hover)`).


---

### `ENH-06` (P1): `DsChipGroup` Enhancements (`allowEmpty`, `variant`, `scrollable`, Touch Target Pseudo-Element)

- **Files:** `src/components/DsChipGroup/DsChipGroup.vue`, `DsChipGroup.html`, `DsChipGroup.scss`
- **New Props Contract:**
  ```ts
  export interface DsChipGroupProps {
    chips: DsChip[]
    label: string
    multiple?: boolean // default: false
    /** When false in single-select mode, clicking the currently active chip is a no-op instead of resetting v-model to ''. Default: true */
    allowEmpty?: boolean
    /** Surface contrast variant so chips stand out on either base or surface backgrounds. Default: 'elevated' */
    variant?: 'surface' | 'elevated'
    /** Enables single-line horizontal scrolling on narrow viewports with hidden scrollbar. Default: false */
    scrollable?: boolean
  }
  ```
- **Required Changes:**
  1. In `DsChipGroup.vue` `toggleChip(chipValue)`:
     ```ts
     const current = typeof model.value === 'string' ? model.value : ''
     if (current === chipValue) {
       if (props.allowEmpty !== false) {
         model.value = ''
       }
       return
     }
     model.value = chipValue
     ```
  2. In `DsChipGroup.scss`, replace `@include ts.target-size;` with `@include ts.target-size-pseudo;` (`position: relative`) so the visual pill height stays compact (`padding-block: var(--ds-space-2)`) while the invisible hit area meets `44x44px` on touch screens (`RESP-04`).
  3. Add `.ds-chip-group--scrollable` (`flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; max-inline-size: 100%;`).
  4. Style `.ds-chip` in `variant="elevated"` with `background-color: var(--ds-color-bg-elevated); border-color: var(--ds-color-border-default); box-shadow: var(--ds-shadow-sm);`.

---

### `ENH-07` (P1): `DsCardGrid` `mode` Prop (`auto-fill` vs `auto-fit`)

- **Files:** `src/components/DsCardGrid/DsCardGrid.vue`, `DsCardGrid.html`, `DsCardGrid.scss`
- **New Props Contract:**
  ```ts
  export interface DsCardGridProps {
    minCardWidth?: string // default: '18rem'
    gap?: 'sm' | 'md' | 'lg' // default: 'md'
    /** 'auto-fill' preserves empty column tracks so 1-2 cards do not stretch across 100% width; 'auto-fit' expands cards to fill row. Default: 'auto-fill' */
    mode?: 'auto-fill' | 'auto-fit'
  }
  ```
- **Required Changes:**
  In `DsCardGrid.scss`:
  ```scss
  .ds-card-grid {
    display: grid;
    grid-template-columns: repeat(var(--ds-grid-mode, auto-fill), minmax(min(100%, var(--ds-grid-min-width, 18rem)), 1fr));
    gap: var(--ds-space-6);

    &--auto-fit {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--ds-grid-min-width, 18rem)), 1fr));
    }
  }
  ```

---

### `ENH-08` (P2): `DsDivider` Component

- **Why Needed:** Replaces ad-hoc `border-block-start: 2px dashed var(--ds-color-border-default)` section dividers (such as Portal's `ScriptsSection`).
- **Files:** `src/components/DsDivider/DsDivider.vue`, `DsDivider.html`, `DsDivider.scss`
- **Props Contract:**
  ```ts
  export interface DsDividerProps {
    orientation?: 'horizontal' | 'vertical' // default: 'horizontal'
    variant?: 'solid' | 'dashed' // default: 'solid'
    spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' // default: 'md'
    label?: string
    decorative?: boolean // default: true (renders role="none" or <hr aria-hidden="true">)
  }
  ```

---

### `ENH-09` (P2): `DsTooltip` Component (WCAG 2.2 SC 1.4.13 Compliant)

- **Why Needed:** Listed in `DESIGN_SYSTEM_PLAN.md` §6 (`Post-1.0 Non-Goals`) and needed for icon-only actions and truncated metadata.
- **Files:** `src/components/DsTooltip/DsTooltip.vue`, `DsTooltip.html`, `DsTooltip.scss`
- **Props Contract:**
  ```ts
  export interface DsTooltipProps {
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right' // default: 'top'
    openDelay?: number // default: 200 (ms)
    closeDelay?: number // default: 150 (ms — allows cursor to move into tooltip per WCAG SC 1.4.13 Hoverable)
  }
  ```
- **Accessibility Contract (WCAG 2.2 SC 1.4.13 — Content on Hover or Focus):**
  1. **Dismissible:** Pressing `Escape` while tooltip is open closes it without moving focus (`useEscapeKey`).
  2. **Hoverable:** Moving the pointer from the trigger element onto the tooltip popover keeps the tooltip open (`@mouseenter` on tooltip cancels the close timer).
  3. **Persistent:** Remains visible until focus/hover leaves, `Escape` is pressed, or the trigger is deactivated.
  4. Uses native `popover="hint"` / `popover="manual"` + `useAnchorFallback` with dynamic `--ds-tooltip-anchor-${id}` and binds `aria-describedby` on the trigger slot element.

---

### `ENH-10` (P3): `DsFooterBar` Landmark Component

- **Files:** `src/components/DsFooterBar/DsFooterBar.vue`, `DsFooterBar.html`, `DsFooterBar.scss`
- **Props & Slots Contract:**
  ```ts
  export interface DsFooterBarProps {
    bordered?: boolean // default: true
    variant?: 'surface' | 'base' // default: 'surface'
  }
  ```
  - **Slots:** `start` (brand/status), `center` (links/navigation), `end` (copyright/version).
  - Renders a semantic `<footer class="ds-footer-bar">` landmark with responsive flex-wrap layout matching `DsHeaderBar`'s max-width container alignment.

---

## 4. Part III — Phased Implementation Roadmap & Verification Gate for Implementing AI

To implement all fixes and components cleanly without regressions, execute in this exact sequence:

### Phase 1: Token Foundation & Audit Script (`DS-01`, `DS-09`, `DS-17`, `DS-18`)
1. Add `--ds-shadow-xl` to `src/styles/tokens/_primitives.scss`.
2. Add `--ds-color-border-hover`, `--ds-color-border-focus`, `--ds-color-border-error`, `--ds-color-focus-ring-error`, `--ds-color-bg-backdrop`, `--ds-color-bg-glass`, and `--ds-color-border-glass` across **all themes** in `src/styles/tokens/_semantic.scss`.
3. Replace hardcoded `#b91c1c` and `rgba(...)` in `DsBadge.scss`, `DsMenu.scss`, `DsModal.scss`, and `DsCard.scss`.
4. Update `scripts/contrast-check.ts` to also fail if any `var(--ds-*)` token used in `src/components/**/*.scss` is undefined in `src/styles/tokens/*.scss`.
5. Run `npm run test:contrast` and verify 0 undefined tokens and 100% WCAG AA contrast pass.

### Phase 2: Critical Accessibility & Existing Component Fixes (`DS-02`–`DS-06`, `DS-10`–`DS-16`)
1. Fix `useAnnouncer.ts` to lazily mount singleton DOM `aria-live="polite"` and `aria-live="assertive"` visually-hidden regions (`DS-02`).
2. Fix `useAnchorFallback.ts` SSR guard and `DsMenu` dynamic `anchor-name`, logical inset properties, and `ArrowUp` key handling (`DS-03`).
3. Fix `DsCard` `target="_blank"` `rel="noopener noreferrer"` + `<DsVisuallyHidden>` warning and `variant="elevated"` background token (`DS-04`).
4. Fix `DsEmptyState.html` `<div class="ds-empty-state__description">` wrapper and slot-aware `aria-describedby` (`DS-05`).
5. Add `defineOptions({ inheritAttrs: false })` to `DsSelect.vue` and `DsSwitch.vue` (`DS-06`).
6. Fix `DsModal` `dismissible` prop and `handleCancel` (`Escape`) guard (`DS-10`), `DsToast` `z-index` token & `<section>` landmark (`DS-11`), `DsIcon` tree-shakable icon registry (`DS-12`), `DsButton` `iconOnly` dev warning (`DS-13`), `DsField` persistent `#hint` + `DsSelect` numeric value preservation (`DS-14`), `DsTabs` logical borders (`DS-15`), and `DsSkipLink` `prefers-reduced-motion` + `DsSearchBar` `Escape` handling (`DS-16`).

### Phase 3: Primitive Enhancements & New Components (`ENH-01`–`ENH-10`)
1. Enhance `DsCard` (`divided`, `interactive`, `accent` — `ENH-05`), `DsChipGroup` (`allowEmpty`, `variant`, `scrollable`, `target-size-pseudo` — `ENH-06`), and `DsCardGrid` (`mode` — `ENH-07`).
2. Implement `useTheme` + `DsThemeToggle` (`ENH-01`).
3. Implement `DsTag` (`ENH-02`), `DsCode` & `DsKbd` (`ENH-03`), and `DsAlert` (`ENH-04`).
4. Implement `DsDivider` (`ENH-08`), `DsTooltip` (`ENH-09`), and `DsFooterBar` (`ENH-10`).
5. Export all new components, composables, and TypeScript types from `src/index.ts`.

### Phase 4: Mandatory Verification Gate
Before bumping version to `1.1.0` in `package.json`, run the full verification suite:
```bash
npm run verify
```
All 5 gates **must** exit with code `0`:
- `npm run test:contrast` — Token contrast & undefined token check across Light, Dark, and Colorblind themes
- `npm run lint` — ESLint + `vuejs-accessibility` with zero warnings
- `npm run typecheck` — `vue-tsc --noEmit` strict check
- `npm run test:unit` — Vitest + Playwright Chromium + `axe-core` accessibility assertions on all components
- `npm run build` — Vite library build + `.d.ts` declaration emission (`dist/vue-ds.js`, `dist/vue-ds.css`, `dist/index.d.ts`)
