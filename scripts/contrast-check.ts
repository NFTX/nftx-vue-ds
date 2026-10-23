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
  // Default Light Theme (Warm Paper & Print Ink Red)
  { name: 'Light: Brand Fill on Warm Paper (print-red vs warm-paper)', fgHex: '#750008', bgHex: '#FAF8F5', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Brand Fill on White (print-red vs white)', fgHex: '#750008', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Focus Ring on Warm Paper (print-red vs warm-paper)', fgHex: '#750008', bgHex: '#FAF8F5', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'Light: Error Text on Warm Paper (red-700 vs warm-paper)', fgHex: '#B91C1C', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Success Text on Warm Paper (emerald-700 vs warm-paper)', fgHex: '#047857', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Warning Text on Warm Paper (amber-700 vs warm-paper)', fgHex: '#B45309', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Info Text on Warm Paper (sky-700 vs warm-paper)', fgHex: '#0369A1', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Text Primary on Warm Paper (slate-800 vs warm-paper)', fgHex: '#1E293B', bgHex: '#FAF8F5', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Light: Text Secondary on Warm Paper (slate-700 vs warm-paper)', fgHex: '#334155', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Text Muted on Warm Paper (slate-600 vs warm-paper)', fgHex: '#475569', bgHex: '#FAF8F5', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Light: Border Interactive on Warm Paper (slate-500 vs warm-paper)', fgHex: '#64748B', bgHex: '#FAF8F5', minRatio: 3.0, targetLevel: 'AA Non-text' },

  // Default Dark Theme (Velvet Midpoint Oxblood & Pale Champagne Gold & Warm Antique Ivory)
  { name: 'Dark: On-Brand on Fill (velvet-oxblood vs champagne-gold)', fgHex: '#3C0911', bgHex: '#FDE68A', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Brand Fill on Velvet (champagne-gold vs velvet-oxblood)', fgHex: '#FDE68A', bgHex: '#3C0911', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'Dark: Brand Text on Velvet (champagne-gold vs velvet-oxblood)', fgHex: '#FDE68A', bgHex: '#3C0911', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Focus Ring on Velvet (champagne-gold vs velvet-oxblood)', fgHex: '#FDE68A', bgHex: '#3C0911', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'Dark: Error Text on Velvet (red-400 vs velvet-oxblood)', fgHex: '#F87171', bgHex: '#3C0911', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Success Text on Velvet (emerald-500 vs velvet-oxblood)', fgHex: '#10B981', bgHex: '#3C0911', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Warning Text on Velvet (amber-500 vs velvet-oxblood)', fgHex: '#F59E0B', bgHex: '#3C0911', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Info Text on Velvet (sky-500 vs velvet-oxblood)', fgHex: '#0EA5E9', bgHex: '#3C0911', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Text Primary on Velvet (warm-ivory vs velvet-oxblood)', fgHex: '#F7F4EE', bgHex: '#3C0911', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Text Secondary on Velvet (warm-ivory-secondary vs velvet-oxblood)', fgHex: '#E5DFD3', bgHex: '#3C0911', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Dark: Text Muted on Velvet (warm-ivory-muted vs velvet-oxblood)', fgHex: '#B8ADA0', bgHex: '#3C0911', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'Dark: Border Interactive on Velvet (champagne-gold vs velvet-oxblood)', fgHex: '#FDE68A', bgHex: '#3C0911', minRatio: 3.0, targetLevel: 'AA Non-text' },

  // Default Color Blind Theme (Universal CVD Okabe-Ito Cobalt Navy & Amber on White)
  { name: 'ColorBlind: Brand Fill on White (cb-cobalt-800 vs white)', fgHex: '#003E7E', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'ColorBlind: Brand Text on slate-50 (cb-cobalt-800 vs slate-50)', fgHex: '#003E7E', bgHex: '#F8FAFC', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'ColorBlind: Focus Ring on White (cb-cobalt-800 vs white)', fgHex: '#003E7E', bgHex: '#FFFFFF', minRatio: 3.0, targetLevel: 'AA Non-text' },
  { name: 'ColorBlind: Error Text on White (cb-rust-700 vs white)', fgHex: '#880000', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Success Text on White (cb-teal-700 vs white)', fgHex: '#004D40', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Warning Text on White (cb-amber-700 vs white)', fgHex: '#9A3412', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Info Text on White (cb-sky-700 vs white)', fgHex: '#005085', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Text Primary on White (slate-900 vs white)', fgHex: '#0F172A', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'ColorBlind: Text Secondary on White (slate-800 vs white)', fgHex: '#1E293B', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Text Muted on White (slate-700 vs white)', fgHex: '#334155', bgHex: '#FFFFFF', minRatio: 4.5, targetLevel: 'AA' },
  { name: 'ColorBlind: Border Interactive on White (cb-cobalt-800 vs white)', fgHex: '#003E7E', bgHex: '#FFFFFF', minRatio: 3.0, targetLevel: 'AA Non-text' },

  // Nested Component Contrast Guarantees (DsBadge nested inside DsTag across 3 Themes)
  { name: 'Nested: Badge inside Tag (Light - slate-800 text on surface white)', fgHex: '#1E293B', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Nested: Badge inside Tag (Dark - warm-ivory text on velvet-surface #2B050B)', fgHex: '#F7F4EE', bgHex: '#2B050B', minRatio: 7.0, targetLevel: 'AAA' },
  { name: 'Nested: Badge inside Tag (ColorBlind - slate-900 text on white)', fgHex: '#0F172A', bgHex: '#FFFFFF', minRatio: 7.0, targetLevel: 'AAA' }
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
  console.log('--- Checking Token Symmetry (TOK-04) Across 3 Default Themes ---')
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
  const colorblindTokens = extractTokens('colorblind-theme-tokens')
  const slateLightTokens = extractTokens('slate-light-tokens')
  const slateDarkTokens = extractTokens('slate-dark-tokens')

  let hasErrors = false
  const allThemes: { name: string; tokens: Set<string> }[] = [
    { name: 'light-theme-tokens', tokens: lightTokens },
    { name: 'dark-theme-tokens', tokens: darkTokens },
    { name: 'colorblind-theme-tokens', tokens: colorblindTokens },
    { name: 'slate-light-tokens', tokens: slateLightTokens },
    { name: 'slate-dark-tokens', tokens: slateDarkTokens }
  ]

  for (let i = 0; i < allThemes.length; i++) {
    for (let j = i + 1; j < allThemes.length; j++) {
      const themeA = allThemes[i]
      const themeB = allThemes[j]
      if (!themeA || !themeB) continue
      for (const token of themeA.tokens) {
        if (!themeB.tokens.has(token)) {
          console.error(`FAIL: Token ${token} is defined in ${themeA.name} but missing in ${themeB.name}.`)
          hasErrors = true
        }
      }
      for (const token of themeB.tokens) {
        if (!themeA.tokens.has(token)) {
          console.error(`FAIL: Token ${token} is defined in ${themeB.name} but missing in ${themeA.name}.`)
          hasErrors = true
        }
      }
    }
  }

  if (!hasErrors) {
    console.log(`PASS: All ${lightTokens.size} semantic tokens are symmetrically defined across Light, Dark, and Color Blind themes.`)
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

  // Light theme: print-red (#750008) vs red-700 (#B91C1C)
  const dELight = deltaEOklab('#750008', '#B91C1C')
  const passLight = dELight >= 10.0
  console.log(`${passLight ? 'PASS' : 'FAIL'}: Light theme brand vs error ΔE(OKLab) = ${dELight.toFixed(1)} (required ≥ 10.0)`)
  if (!passLight) passed = false

  // Dark theme text: champagne-gold (#FDE68A) vs red-400 (#F87171)
  const dEDark = deltaEOklab('#FDE68A', '#F87171')
  const passDark = dEDark >= 10.0
  console.log(`${passDark ? 'PASS' : 'FAIL'}: Dark theme brand vs error text ΔE(OKLab) = ${dEDark.toFixed(1)} (required ≥ 10.0)`)
  if (!passDark) passed = false

  // Color Blind theme: cb-cobalt-800 (#003E7E) vs cb-rust-700 (#880000)
  const dECb = deltaEOklab('#003E7E', '#880000')
  const passCb = dECb >= 10.0
  console.log(`${passCb ? 'PASS' : 'FAIL'}: Color Blind theme brand vs error ΔE(OKLab) = ${dECb.toFixed(1)} (required ≥ 10.0)`)
  if (!passCb) passed = false

  return passed
}

function collectScssFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectScssFiles(full))
    } else if (entry.name.endsWith('.scss')) {
      results.push(full)
    }
  }
  return results
}

function checkComponentTokens(): boolean {
  console.log('\n--- Checking Component SCSS for Undefined var(--ds-*) Tokens & Hardcoded Colors (TOK-01, CSS-02) ---')
  const semanticScssPath = path.resolve(__dirname, '../src/styles/tokens/_semantic.scss')
  const semanticContent = fs.readFileSync(semanticScssPath, 'utf-8')

  const definedTokens = new Set<string>()
  const defRegex = /(--ds-[a-z0-9-]+):/g
  let match: RegExpExecArray | null
  while ((match = defRegex.exec(semanticContent)) !== null) {
    if (match[1]) definedTokens.add(match[1])
  }

  // Allowed component-local dynamic custom properties
  const allowedComponentVars = new Set<string>([
    '--ds-card-grid-min-col',
    '--ds-grid-min-width',
    '--ds-grid-mode',
    '--ds-menu-anchor-name',
    '--ds-tooltip-anchor-name',
    '--ds-header-height',
    '--ds-card-accent'
  ])

  const componentsDir = path.resolve(__dirname, '../src/components')
  const scssFiles = collectScssFiles(componentsDir)
  let passed = true

  for (const file of scssFiles) {
    const relPath = path.relative(path.resolve(__dirname, '..'), file)
    const content = fs.readFileSync(file, 'utf-8')

    // 1. Check all var(--ds-*) references
    const varRegex = /var\(\s*(--ds-[a-z0-9-]+)/g
    let vMatch: RegExpExecArray | null
    while ((vMatch = varRegex.exec(content)) !== null) {
      const tokenName = vMatch[1]
      if (tokenName && !definedTokens.has(tokenName) && !allowedComponentVars.has(tokenName)) {
        console.error(`FAIL: Undefined token ${tokenName} referenced in ${relPath}`)
        passed = false
      }
    }

    // 2. Check for hardcoded hex or rgb/rgba color literals in component SCSS
    const lines = content.split('\n')
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return
      const withoutComments = trimmed.replace(/\/\/.*$/, '')
      if (/#[0-9a-fA-F]{3,8}\b/.test(withoutComments) || /\brgba?\s*\(/.test(withoutComments)) {
        console.error(`FAIL: Hardcoded color literal in ${relPath}:${idx + 1}: ${trimmed}`)
        passed = false
      }
    })
  }

  if (passed) {
    console.log(`PASS: All var(--ds-*) references across ${scssFiles.length} component SCSS files are defined and 0 hardcoded colors found.`)
  }
  return passed
}

function run(): void {
  console.log('=== Design System Token & Contrast Verification ===\n')
  const symmetryPass = checkThemeSymmetry()
  const contrastPass = checkContrastPairs()
  const deltaEPass = checkPerceptualSeparation()
  const componentTokenPass = checkComponentTokens()

  if (symmetryPass && contrastPass && deltaEPass && componentTokenPass) {
    console.log('\nAll token, contrast, perceptual distance, and component SCSS checks PASSED.\n')
    process.exit(0)
  } else {
    console.error('\nOne or more checks FAILED. See log output above.\n')
    process.exit(1)
  }
}

run()
