# Repository Rules (`@nftx/vue-ds`)

1. Read [IMPLEMENTATION_GUIDELINES.md](./IMPLEMENTATION_GUIDELINES.md) before writing, modifying, or reviewing any code in this repository. All rule IDs (`META-*`, `ARCH-*`, `VUE-*`, `TS-*`, `TOK-*`, `CSS-*`, `RESP-*`, `A11Y-*`, `SB-*`, `TEST-*`, `DOD-*`, `CI-*`, `PKG-*`) are binding.
2. Read [DESIGN_SYSTEM_PLAN.md](./DESIGN_SYSTEM_PLAN.md) for component scope, design token values, and phase ordering.
3. Do not add any headless UI library (`reka-ui`, `radix-vue`, `@headlessui/vue`, `@floating-ui/dom`, etc.). Use native HTML elements (`<dialog>`, `<select>`, `[popover]`, CSS Anchor Positioning) plus the in-house composables specified in `IMPLEMENTATION_GUIDELINES.md` §7.4 and §9.5.
4. No component or phase is complete until `npm run verify` passes all automated gates and every scorecard row (`G-01`–`G-10`) in `IMPLEMENTATION_GUIDELINES.md` §13 is `PASS`.
