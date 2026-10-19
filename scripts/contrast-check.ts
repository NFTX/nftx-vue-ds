// scripts/contrast-check.ts
// Enforces TEST-11, A11Y-01..A11Y-03, TOK-04
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Relative luminance formula (WCAG 2.2)
function srgbToLinear(c: number): number {
  const norm = c / 255
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return [r, g, b]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// OKLab Color space & DeltaE (OKLab * 100)
function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  return [L, a, b_]
}

function deltaEOklab(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  const [l1, a1, b1_] = rgbToOklab(r1, g1, b1)
  const [l2, a2, b2_] = rgbToOklab(r2, g2, b2)
  const dl = l1 - l2
  const da = a1 - a2
  const db = b1_ - b2_
  return Math.sqrt(dl * dl + da * da + db * db) * 100
}

interface ContrastAssertion {
  name: string
  fgHex: string
  bgHex: string
  minRatio: number
  targetLevel: string
}

const assertions: ContrastAssertion[] = [
  // Light Theme
  { name: 'Light: Brand Fill on White (rose-800 vs white)', fgHex: '#9F1239', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Brand Text on slate-50 (rose-800 vs slate-50)', fgHex: '#9F1239', bgHex: '#F8FAFC', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Focus Ring on White (rose-800 vs white)', fgHex: '#9F1239', bgHex: '#FFFFFF', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'Light: Error Text on White (red-600 vs white)', fgHex: '#DC2626', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Success Text on White (emerald-700 vs white)', fgHex: '#047857', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Warning Text on White (amber-700 vs white)', fgHex: '#B45309', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Info Text on White (sky-700 vs white)', fgHex: '#0369A1', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Text Primary on White (slate-900 vs white)', fgHex: '#0F172A', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Text Secondary on White (slate-700 vs white)', fgHex: '#334155', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Text Muted on White (slate-600 vs white)', fgHex: '#475569', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Border Interactive on White (slate-500 vs white)', fgHex: '#64748B', bgHex: '#FFFFFF', minRatio: 3.0, targetLevel: 'AA Non-text' },

  // Dark Theme
  { name: 'Dark: White on Brand Fill (white vs rose-700)', fgHex: '#FFFFFF', bgHex: '#BE123C', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Brand Text on slate-900 (rose-300 vs slate-900)', fgHex: '#FDA4AF', bgHex: '#0F172A', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Focus Ring on slate-900 (rose-300 vs slate-900)', fgHex: '#FDA4AF', bgHex: '#0F172A', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'Dark: Error Text on slate-900 (red-400 vs slate-900)', fgHex: '#F87171', bgHex: '#0F172A', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Success Text on slate-900 (emerald-500 vs slate-900)', fgHex: '#10B981', bgHex: '#0F172A', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Warning Text on slate-900 (amber-500 vs slate-900)', fgHex: '#F59E0B', bgHex: '#0F172A', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Info Text on slate-900 (sky-500 vs slate-900)', fgHex: '#0EA5E9', bgHex: '#0F172A', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Text Primary on slate-900 (slate-50 vs slate-900)', fgHex: '#F8FAFC', bgHex: '#0F172A', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Text Secondary on slate-900 (slate-200 vs slate-900)', fgHex: '#E2E8F0', bgHex: '#0F172A', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Text Muted on slate-900 (slate-400 vs slate-900)', fgHex: '#94A3B8', bgHex: '#0F172A', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Border Interactive on slate-900 (slate-500 vs slate-900)', fgHex: '#64748B', bgHex: '#0F172A', minRatio: 3.0, targetLevel: 'AA Non-text' }
]

function extractMixinBody(content: string, mixinName: string): string {
  const startPattern = `@mixin ${mixinName}`
  const startIndex = content.indexOf(startPattern)
  if (startIndex === -1) {
    throw new Error(`Could not find mixin "${mixinName}" in file`)
  }

  const openBraceIndex = content.indexOf('{', startIndex)
  if (openBraceIndex === -1) {
    throw new Error(`Could not find opening brace for mixin "${mixinName}"`)
  }

  let braceCount = 1
  let currentIndex = openBraceIndex + 1

  while (currentIndex < content.length && braceCount > 0) {
    const char = content[currentIndex]
    if (char === '{') {
      braceCount++
    } else if (char === '}') {
      braceCount--
    }
    currentIndex++
  }

  return content.substring(openBraceIndex + 1, currentIndex - 1)
}

function checkThemeSymmetry(): boolean {
  console.log('--- Checking Token Symmetry (TOK-04) ---')
  const semanticScssPath = path.resolve(__dirname, '../src/styles/tokens/_semantic.scss')
  const content = fs.readFileSync(semanticScssPath, 'utf-8')

  const extractTokens = (mixinName: string): Set<string> => {
    const body = extractMixinBody(content, mixinName)
    const tokenRegex = /(--ds-[a-z0-9-]+):/g
    const tokens = new Set<string>()
    let m: RegExpExecArray | null
    while ((m = tokenRegex.exec(body)) !== null) {
      if (m[1]) tokens.add(m[1])
    }
    return tokens
  }

  const lightTokens = extractTokens('light-theme-tokens')
  const darkTokens = extractTokens('dark-theme-tokens')

  let hasErrors = false
  for (const token of lightTokens) {
    if (!darkTokens.has(token)) {
      console.error(`FAIL: Token ${token} is defined in light-theme-tokens but missing in dark-theme-tokens.`)
      hasErrors = true
    }
  }
  for (const token of darkTokens) {
    if (!lightTokens.has(token)) {
      console.error(`FAIL: Token ${token} is defined in dark-theme-tokens but missing in light-theme-tokens.`)
      hasErrors = true
    }
  }

  if (!hasErrors) {
    console.log(`PASS: All ${lightTokens.size} semantic tokens are symmetrically defined in light and dark themes.`)
  }
  return !hasErrors
}

function checkContrastPairs(): boolean {
  console.log('\n--- Checking WCAG 2.2 Contrast Pairs (A11Y-01, A11Y-02, TEST-11) ---')
  let passed = true

  for (const item of assertions) {
    const ratio = contrastRatio(item.fgHex, item.bgHex)
    const pass = ratio >= item.minRatio
    const formattedRatio = ratio.toFixed(2)
    if (pass) {
      console.log(`PASS: ${item.name} -> ${formattedRatio}:1 (required ≥ ${item.minRatio}:1 [${item.targetLevel}])`)
    } else {
      console.error(`FAIL: ${item.name} -> ${formattedRatio}:1 (FAILED: required ≥ ${item.minRatio}:1 [${item.targetLevel}])`)
      passed = false
    }
  }

  return passed
}

function checkPerceptualSeparation(): boolean {
  console.log('\n--- Checking Brand vs Error Perceptual Separation (A11Y-03, TEST-11) ---')
  let passed = true

  // Light theme: rose-800 (#9F1239) vs red-600 (#DC2626)
  const dELight = deltaEOklab('#9F1239', '#DC2626')
  const passLight = dELight >= 10.0
  console.log(`${passLight ? 'PASS' : 'FAIL'}: Light theme brand vs error ΔE(OKLab) = ${dELight.toFixed(1)} (required ≥ 10.0)`)
  if (!passLight) passed = false

  // Dark theme text: rose-300 (#FDA4AF) vs red-400 (#F87171)
  const dEDark = deltaEOklab('#FDA4AF', '#F87171')
  const passDark = dEDark >= 10.0
  console.log(`${passDark ? 'PASS' : 'FAIL'}: Dark theme brand vs error text ΔE(OKLab) = ${dEDark.toFixed(1)} (required ≥ 10.0)`)
  if (!passDark) passed = false

  return passed
}

function run(): void {
  console.log('=== Design System Token & Contrast Verification ===\n')
  const symmetryPass = checkThemeSymmetry()
  const contrastPass = checkContrastPairs()
  const deltaEPass = checkPerceptualSeparation()

  if (symmetryPass && contrastPass && deltaEPass) {
    console.log('\nAll token, contrast, and perceptual distance checks PASSED.\n')
    process.exit(0)
  } else {
    console.error('\nOne or more checks FAILED. See log output above.\n')
    process.exit(1)
  }
}

run()
