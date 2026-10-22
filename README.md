# @nftx-dev/vue-ds

A production-ready Vue 3 + TypeScript component library and design token system built with native browser primitives, strict WCAG 2.2 Level AA/AAA accessibility compliance, and three mathematically verified default themes (**Light**, **Dark**, and **Color Blind**).

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Installation & Setup](#-installation--setup)
3. [The Three Default Themes](#-the-three-default-themes)
4. [Component Catalog](#-component-catalog)
5. [Usage Examples](#-usage-examples)
6. [Validating with Portal (Reference Client)](#-validating-with-portal-reference-client)
7. [Storybook Interactive Playground](#-storybook-interactive-playground)
8. [Overriding Design Tokens](#-overriding-design-tokens)
9. [Documentation Guide](#-documentation-guide)

---

## ✨ Key Features

- **Vue 3 + Strict TypeScript:** Full ESM distribution with pristine `.d.ts` declaration files and zero unresolved path aliases.
- **Three Default Themes Out of the Box:**
  - 📜 **Default Light:** Archival "Warm Paper" (`#FAF8F5`) + "Print Ink Red" (`#750008`, 11.26:1 AAA) + Deep Charcoal (`#1E293B`, 13.80:1 AAA).
  - 🍷 **Default Dark:** Luminous "Velvet Oxblood" (`#3C0911`) + "Pale Champagne Gold" (`#FDE68A`, 13.61:1 AAA) + "Warm Antique Ivory" (`#F7F4EE`, 15.44:1 AAA — eliminates optical glare).
  - 👁️ **Default Color Blind:** Scientifically engineered Okabe-Ito Universal CVD palette for the worst-case scenario across Protanopia, Deuteranopia, Tritanopia, and complete Achromatopsia/monochromacy.
- **Zero Headless UI Runtime Dependencies:** Built strictly on native HTML5 standards (`<dialog>`, native `[popover]`, CSS Anchor Positioning, `:has()`) paired with in-house accessible roving focus and announcer composables.
- **Strict Accessibility:** 100% automated axe-core clean, WCAG 2.2 target sizes (min 24px fine, 44px touch), visible focus rings, and forced-colors (Windows High Contrast) support.

---

## 📦 Installation & Setup

### 1. Install the Package

In your Vue 3 application:

```bash
# Install from npm registry:
npm install @nftx-dev/vue-ds

# Or install from a local packed tarball (e.g. for air-gapped or staging builds):
npm install file:./nftx-dev-vue-ds-1.0.1.tgz
```

In your client's `package.json`:
```json
{
  "dependencies": {
    "@nftx-dev/vue-ds": "^1.0.0",
    "vue": "^3.4.0"
  }
}
```

### 2. Import Styles in Your Entrypoint

Import the stylesheets in your application's entrypoint (`main.ts` or `main.js`):

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// Import design tokens first, then compiled components and base reset
import '@nftx-dev/vue-ds/tokens.css'
import '@nftx-dev/vue-ds/styles.css'

createApp(App).mount('#app')
```

> **Style Exports Available:**
> - `@nftx-dev/vue-ds/tokens.css` — Design tokens (CSS custom properties for all 3 themes)
> - `@nftx-dev/vue-ds/styles.css` — Complete bundle (Tokens + Base Reset + All Components)
> - `@nftx-dev/vue-ds/scss` — Raw SCSS mixins and variables for advanced Sass pipelines

---

## 🎨 The Three Default Themes

The library delivers three default themes that are active out of the box unless overwritten.

| Theme | HTML Attribute | Canvas Base | Primary Brand / Action | Primary Body Text | Best Used For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Light Mode** *(Default)* | `data-theme="light"` | `#FAF8F5` *(Warm Paper)* | `#750008` *(Print Ink Red)* | `#1E293B` *(Charcoal)* | High-readability editorial content, articles, portals |
| **Dark Mode** | `data-theme="dark"` | `#3C0911` *(Velvet Oxblood)* | `#FDE68A` *(Pale Champagne)* | `#F7F4EE` *(Warm Ivory)* | Night reading, low-light setups, glare-free homelab |
| **Color Blind Mode** | `data-theme="colorblind"` | `#FFFFFF` *(Pure White)* | `#003E7E` *(Cobalt Navy)* | `#0F172A` *(Jet Slate)* | Universal accessibility (Protan, Deutan, Tritan, Monochromacy) |

### Activating Themes in HTML

Set the `data-theme` attribute on your `<html>` tag or on any container element:

```html
<!-- Light Theme -->
<html data-theme="light">

<!-- Dark Theme -->
<html data-theme="dark">

<!-- Color Blind Theme -->
<html data-theme="colorblind">
```

### Switching Themes with `DsHeaderBar`

`DsHeaderBar` has integrated 3-theme switching support. Pass `:available-themes="['light', 'dark', 'colorblind']"`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DsHeaderBar, type DsThemeMode } from '@nftx-dev/vue-ds'

const currentTheme = ref<DsThemeMode>('light')
</script>

<template>
  <div :data-theme="currentTheme">
    <DsHeaderBar
      title="Homelab Portal"
      subtitle="Local Service Gateway"
      v-model:theme="currentTheme"
      :available-themes="['light', 'dark', 'colorblind']"
    />
  </div>
</template>
```

> **Theme Toggle Button Behavior (Target Action):**
> The toggle button icon, tooltip, and `aria-label` reflect the **target state** that clicking will activate:
> - In **Light mode**: displays `moon` icon (Label: *"Switch to dark theme"*) &rarr; transitions to **Dark**.
> - In **Dark mode**: displays `eye` icon (Label: *"Switch to color blind theme"*) &rarr; transitions to **Colorblind**.
> - In **Colorblind mode**: displays `sun` icon (Label: *"Switch to light theme"*) &rarr; transitions to **Light**.

---

## 🧩 Component Catalog

All components are exported directly from the package root `@nftx-dev/vue-ds`:

| Category | Components | Description |
| :--- | :--- | :--- |
| **Layout & Primitives** | [`DsHeaderBar`](#dsheaderbar), [`DsFooterBar`](#dsfooterbar), [`DsCardGrid`](#dscardgrid), [`DsDivider`](#dsdivider), [`DsEmptyState`](#dsemptystate), [`DsSkipLink`](#dsskiplink) | Semantic header & footer landmarks, responsive CSS grid, structural dividers, zero-data feedback, a11y skip navigation. |
| **Core Atoms** | [`DsButton`](#dsbutton), [`DsBadge`](#dsbadge), [`DsTag`](#dstag), [`DsCode`](#dscode), [`DsKbd`](#dskbd), [`DsIcon`](#dsicon), [`DsSpinner`](#dsspinner), [`DsLink`](#dslink), [`DsVisuallyHidden`](#dsvisuallyhidden) | Buttons with loading/icons, status badges, removable metadata tags, inline/block code with copy, keyboard shortcuts, tree-shaken Lucide icons, spinners, accessible links. |
| **Form Controls** | [`DsField`](#dsfield), [`DsInput`](#dsinput), [`DsTextarea`](#dstextarea), [`DsSelect`](#dsselect), [`DsCheckbox`](#dscheckbox), [`DsRadioGroup`](#dsradiogroup), [`DsSwitch`](#dsswitch) | Form fields with labels, error states, ARIA descriptions, and native form elements. |
| **Composite & Overlays** | [`DsCard`](#dscard), [`DsAlert`](#dsalert), [`DsChipGroup`](#dschipgroup), [`DsSearchBar`](#dssearchbar), [`DsThemeToggle`](#dsthemetoggle), [`DsTabs`](#dstabs), [`DsMenu`](#dsmenu), [`DsModal`](#dsmodal), [`DsToast`](#dstoast), [`DsTooltip`](#dstooltip) | Content cards, semantic inline alerts, category filter chips, search input with shortcuts, theme switcher, APG tabs/menus/dialogs/toasts/tooltips. |
| **Composables** | `useTheme`, `useRovingFocus`, `useTypeahead`, `useFocusReturn`, `useAnnouncer`, `useAnchorFallback` | Reactive theme persistence and WAI-ARIA APG keyboard/focus/live-region primitives. |

---

## 💻 Usage Examples

### 1. Interactive Button with Loading State

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DsButton } from '@nftx-dev/vue-ds'

const isSubmitting = ref(false)

async function handleClick() {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  isSubmitting.value = false
}
</script>

<template>
  <DsButton
    variant="primary"
    size="md"
    :loading="isSubmitting"
    prefix-icon="check"
    @click="handleClick"
  >
    Save Changes
  </DsButton>
</template>
```

### 2. Form Field with Validation State

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DsField, DsInput } from '@nftx-dev/vue-ds'

const email = ref('')
const error = ref('')
</script>

<template>
  <DsField
    label="Email Address"
    description="We'll send system notifications here."
    :error="error"
    required
  >
    <DsInput
      v-model="email"
      type="email"
      placeholder="user@homelab.local"
      :invalid="Boolean(error)"
    />
  </DsField>
</template>
```

### 3. Service Card Grid with Badges & Search

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { DsSearchBar, DsCardGrid, DsCard, DsBadge, DsButton } from '@nftx-dev/vue-ds'

const search = ref('')
const services = [
  { id: 1, name: 'Plex Media Server', port: 32400, status: 'Active' },
  { id: 2, name: 'Home Assistant', port: 8123, status: 'Active' }
]

const filtered = computed(() =>
  services.filter(s => s.name.toLowerCase().includes(search.value.toLowerCase()))
)
</script>

<template>
  <div>
    <DsSearchBar v-model="search" placeholder="Search services..." />

    <DsCardGrid min-col-width="18rem" gap="md" style="margin-top: 1.5rem;">
      <li v-for="svc in filtered" :key="svc.id" role="listitem">
        <DsCard variant="elevated" padding="md">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>{{ svc.name }}</h3>
              <DsBadge variant="brand">{{ svc.status }}</DsBadge>
            </div>
          </template>
          <p>Port: {{ svc.port }}</p>
          <template #footer>
            <DsButton variant="ghost" size="sm">Open Dashboard &rarr;</DsButton>
          </template>
        </DsCard>
      </li>
    </DsCardGrid>
  </div>
</template>
```

### 4. Semantic Icons with Fallback (`DsIcon`)

`DsIcon` wraps Lucide icons with accessible semantics, flexible name resolution (kebab-case, PascalCase, snake_case), and graceful fallback support:

```vue
<script setup lang="ts">
import { DsIcon } from '@nftx-dev/vue-ds'
</script>

<template>
  <!-- Resolves Lucide icon by kebab-case, snake_case, or PascalCase -->
  <DsIcon icon="shield-check" size="lg" aria-hidden="true" />

  <!-- Falls back to "server" if the requested icon name is not found in Lucide -->
  <DsIcon icon="unknown-custom-service" fallback="server" size="md" aria-label="Service status" />
</template>
```

---

## 🔍 Validating with Portal (Reference Client)

The `/workspace/Projects/portal` project serves as the real-world reference consumer for `@nftx-dev/vue-ds`. Use it to validate component integration, responsive behavior, and theme switching.

### Step 1: Build the Design System
Ensure latest library artifacts and stylesheets are compiled:

```bash
cd /workspace/Projects/design-system
npm run build
```

### Step 2: Validate the Portal Application Build
Run `vue-tsc` and `vite build` inside the Portal:

```bash
cd /workspace/Projects/portal
npm run build
```

### Step 3: Run Portal in Development Mode
Launch the local Vite development server:

```bash
cd /workspace/Projects/portal
npm run dev
```

### Step 4: Run Portal in Docker (Production Nginx Container)
To test Portal inside its isolated multi-stage Docker container:

```bash
cd /workspace/Projects/portal
docker compose up -d --build
```

Then visit:
```
http://localhost
```

#### What to Verify on Portal:
1. **Header Bar:** Check title, subtitle, search input hotkeys, and theme switch button.
2. **Theme Switching:** Toggle between Light and Dark mode to confirm immediate token changes without page reload.
3. **Category Chips:** Filter services by clicking category chips.
4. **Empty State:** Type a nonexistent service name into the search bar to verify `DsEmptyState` renders with clear action button.
5. **Card Grid Responsiveness:** Resize browser width down to 320px to confirm zero horizontal scrollbar overflow.

---

## 🚀 Storybook Interactive Playground

Storybook allows you to inspect every component variant, test interactive props, view accessibility trees, and run live colorblind simulations.

### Running Storybook Locally

```bash
cd /workspace/Projects/design-system
npm run storybook
```

### Running Storybook with Docker Compose

An isolated Nginx container runs the production Storybook build on port 6006:

```bash
cd /workspace/Projects/design-system
docker compose up -d --build
```

Open your browser at:
```
http://localhost:6006
```

#### Key Stories to Explore:
- **`Foundations / Colors`:** Complete contrast tables, relative luminance values, and OKLab ΔE perceptual separation readouts.
- **`Pages / HomelabDashboardDemo`:** Integrated dashboard with live 3-theme switching.
- **`Pages / EditorialBlogPostDemo`:** In-context typographic test with integrated SVG Color Vision Deficiency simulator (Deuteranopia, Protanopia, Tritanopia, and Achromatopsia/Grayscale).

---

## 🛠️ Overriding Design Tokens

Consumers can customize any color, spacing, radius, or font token using CSS custom properties without modifying the library source.

```css
/* Override tokens in your application's global CSS */
:root {
  /* Brand accent override */
  --ds-color-brand-fill: #0066CC;
  --ds-color-brand-text: #0066CC;

  /* Custom typography */
  --ds-font-family-system: "Inter", system-ui, sans-serif;
}

/* Specific theme overrides */
[data-theme='light'] {
  --ds-color-bg-base: #FFFFFF; /* Override Warm Paper with pure white */
}

[data-theme='dark'] {
  --ds-color-bg-base: #0F172A; /* Override Velvet Oxblood with dark slate */
}
```

---

## 📚 Documentation Guide

This library is organized with a clear separation between **consumer usage** and **internal maintenance**:

- **For Application Developers & Consumers:**
  - This **[`README.md`](./README.md)** is your single source of truth for installation, component usage, themes, and Portal validation.
  - Interactive component documentation is available in **Storybook** (`npm run storybook` or `http://localhost:6006`).
- **For Design System Maintainers Only:**
  - `IMPLEMENTATION_GUIDELINES.md` — Internal architecture standards (`ARCH-*`, `A11Y-*`, `TOK-*`) and verification scorecard.
  - `INITIAL_IMPLEMENTATION_HISTORY.md` — Historical implementation log across Phases 1 through 7.
  - `DESIGN_SYSTEM_PLAN.md` — Original component roadmap and phase milestones.
