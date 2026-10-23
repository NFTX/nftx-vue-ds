# Design System Contrast & Component Validation Checklist

This checklist tracks verified contrast pairs, token symmetry, and compound component patterns to avoid redundant re-testing. All entries below are enforced continuously by automated CI checks (`npm run test:tokens`, `npm run test:unit`, and Playwright E2E walkthroughs).

## 1. Automated Token & Contrast Math Status (`scripts/contrast-check.ts`)

| Category | Theme | Pair / Property | Contrast Ratio | Required Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand** | Light | Brand Fill on Warm Paper (`#750008` vs `#FBF7EE`) | 11.26:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Brand** | Light | Brand Fill on White (`#750008` vs `#FFFFFF`) | 11.93:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Focus Ring** | Light | Focus Ring on Warm Paper (`#750008` vs `#FBF7EE`) | 11.26:1 | ≥ 3.0:1 (Non-text) | ✅ PASS |
| **Error** | Light | Error Text on Warm Paper (`#B91C1C` vs `#FBF7EE`) | 6.10:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Success** | Light | Success Text on Warm Paper (`#047857` vs `#FBF7EE`) | 5.17:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Warning** | Light | Warning Text on Warm Paper (`#B45309` vs `#FBF7EE`) | 4.74:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Info** | Light | Info Text on Warm Paper (`#0369A1` vs `#FBF7EE`) | 5.60:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Text Primary** | Light | Text Primary on Warm Paper (`#1E293B` vs `#FBF7EE`) | 13.80:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Text Secondary**| Light | Text Secondary on Warm Paper (`#334155` vs `#FBF7EE`) | 9.77:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Text Muted** | Light | Text Muted on Warm Paper (`#475569` vs `#FBF7EE`) | 7.15:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Text Primary** | Dark | Warm Ivory on Velvet Oxblood (`#F7F4EE` vs `#3C0911`) | 15.44:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Text Secondary**| Dark | Warm Ivory Secondary on Velvet (`#E5DFD3` vs `#3C0911`)| 12.77:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Text Muted** | Dark | Warm Ivory Muted on Velvet (`#B8ADA0` vs `#3C0911`) | 7.68:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Brand Text** | Dark | Champagne Gold on Velvet (`#FDE68A` vs `#3C0911`) | 13.61:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Error Text** | Dark | Red-400 on Velvet (`#F87171` vs `#3C0911`) | 6.13:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Success Text**| Dark | Emerald-500 on Velvet (`#10B981` vs `#3C0911`) | 6.68:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Warning Text**| Dark | Amber-500 on Velvet (`#F59E0B` vs `#3C0911`) | 7.89:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Info Text** | Dark | Sky-500 on Velvet (`#0EA5E9` vs `#3C0911`) | 6.11:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Brand Fill** | ColorBlind | Okabe-Ito Cobalt Navy on White (`#003E7E` vs `#FFFFFF`) | 10.55:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Text Primary** | ColorBlind | Slate-900 on White (`#0F172A` vs `#FFFFFF`) | 17.85:1 | ≥ 7.0:1 (AAA) | ✅ PASS |
| **Text Secondary**| ColorBlind| Slate-800 on White (`#1E293B` vs `#FFFFFF`) | 14.63:1 | ≥ 4.5:1 (AA) | ✅ PASS |
| **Text Muted** | ColorBlind | Slate-700 on White (`#334155` vs `#FFFFFF`) | 10.35:1 | ≥ 4.5:1 (AA) | ✅ PASS |

---

## 2. Compound / Nested Component Validation

| Pattern | Themes Verified | Contrast Ratio | Notes | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`DsBadge` inside `DsTag`** | Light | 14.63:1 | Text `#1E293B` on `#FFFFFF` surface | ✅ PASS |
| **`DsBadge` inside `DsTag`** | Dark | 16.94:1 | Text `#F7F4EE` on `#2B050B` surface | ✅ PASS |
| **`DsBadge` inside `DsTag`** | ColorBlind | 17.85:1 | Text `#0F172A` on `#FFFFFF` surface | ✅ PASS |
| **`DsTag` with prefix (`#`)** | Light, Dark, CVD | ≥ 7.0:1 | Prefix uses `--ds-color-text-muted` | ✅ PASS |
| **`DsCard` with `title` prop** | Light, Dark, CVD | ≥ 12.0:1 | Header renders `<h3 class="ds-card__title">` | ✅ PASS |
| **`DsTabs` mobile horizontal scroll** | Viewports 360px-390px | Touch-scrolled | `.ds-tabs__list` with `scrollbar-width: none` | ✅ PASS |
| **`DsHeaderBar` uncontrolled toggle** | Light ➔ Dark ➔ CVD | Active DOM sync | Cycles `data-theme` and updates `localStorage` | ✅ PASS |
