# @nftx-dev/vue-ds

Vue 3 design system library. The reference consumer is the sibling `portal` repository.

## Documentation boundaries

- When explaining how to install, use, style, or configure components, point to `README.md` and Storybook (`npm run storybook`, port 6006). Those are the public documentation.
- `IMPLEMENTATION_GUIDELINES.md`, `INITIAL_IMPLEMENTATION_HISTORY.md`, and `DESIGN_SYSTEM_PLAN.md` are internal maintainer notes. Use them for context, but do not send consumers to them.
- Component requests from consumer apps are tracked in `REQUESTED_COMPONENTS.md`. Promote a component to the library only when it is useful beyond the app that asked for it.

## Themes

Three default themes, selected with `data-theme` on the root element: `light`, `dark`, `colorblind` (Okabe-Ito palette).

- Every semantic token in `src/styles/tokens/_semantic.scss` must be defined in all three theme mixins (`light-theme-tokens`, `dark-theme-tokens`, `colorblind-theme-tokens`). `npm run test:tokens` enforces this and the contrast ratios.
- Consumers override tokens through `--ds-*` CSS custom properties.

## Library rules

- Do not add headless UI or positioning libraries (`reka-ui`, `radix-vue`, `@headlessui/vue`, `@floating-ui/dom`, Popper). Use native elements and CSS (`<dialog>`, `[popover]`, anchor positioning, `:has()`) plus the composables in `src/composables/a11y/`. This keeps the library dependency-free and small.
- Each component lives in `src/components/Ds{Name}/` with six files:
  - `Ds{Name}.vue`: `<script setup lang="ts">`, referencing the template and styles.
  - `Ds{Name}.html`: template.
  - `Ds{Name}.scss`: scoped styles.
  - `Ds{Name}.spec.ts`: Vitest tests (browser mode).
  - `Ds{Name}.stories.ts`: Storybook CSF3 stories.
  - `index.ts`: public export.

## Verification

A change is complete when `npm run verify` passes. It runs lint, typecheck, token and contrast checks, unit tests (100% coverage), Storybook tests (zero axe violations), the library build, and a smoke test that installs the packed tarball into a consumer.

To check a change against `portal` before publishing: `portal` installs the published package from npm, so a plain `portal` build does not see local changes. Install the local build first:

```bash
npm run build
cd ../portal && npm install --no-save ../design-system && npm run build
```

Run `npm install` in `portal` afterwards to return to the published version.
