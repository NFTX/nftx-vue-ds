// scripts/contrast-check.ts
// Enforces TEST-11, A11Y-01..A11Y-03, TOK-04
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

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

const THEME_MIXINS = {
  light: 'light-theme-tokens',
  dark: 'dark-theme-tokens',
  colorblind: 'colorblind-theme-tokens',
  'slate-light': 'slate-light-tokens',
  'slate-dark': 'slate-dark-tokens'
} as const

type ThemeName = keyof typeof THEME_MIXINS
type ThemeTokens = Map<string, string>

// Compile each theme mixin with Sass, so the checks use the real token values
function resolveThemeTokens(): Record<ThemeName, ThemeTokens> {
  const tokensDir = path.resolve(__dirname, '../src/styles/tokens')
  const source = ["@use 'semantic' as s;"]
  for (const [theme, mixin] of Object.entries(THEME_MIXINS)) {
    source.push(`.check-${theme} { @include s.${mixin}; }`)
  }
  const css = sass.compileString(source.join('\n'), { loadPaths: [tokensDir], style: 'expanded' }).css

  const result = {} as Record<ThemeName, ThemeTokens>
  for (const theme of Object.keys(THEME_MIXINS) as ThemeName[]) {
    const block = new RegExp(`\\.check-${theme} \\{([^}]*)\\}`).exec(css)?.[1]
    if (!block) throw new Error(`Could not compile tokens for theme "${theme}"`)
    const tokens: ThemeTokens = new Map()
    for (const m of block.matchAll(/(--ds-[a-z0-9-]+):\s*([^;]+);/g)) {
      if (m[1] && m[2]) tokens.set(m[1], m[2].trim())
    }
    result[theme] = tokens
  }
  return result
}

function hexOf(tokens: ThemeTokens, token: string, theme: ThemeName): string {
  const value = tokens.get(`--ds-color-${token}`)
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Token --ds-color-${token} in ${theme} is not a 6-digit hex color: ${value}`)
  }
  return value
}

interface ContrastPair {
  fg: string
  bg: string
  minRatio: number
}

const AA_TEXT = 4.5
const AAA_TEXT = 7.0
const NON_TEXT = 3.0
const STATUSES = ['error', 'success', 'warning', 'info'] as const

// Checked in every theme
const COMMON_PAIRS: ContrastPair[] = [
  { fg: 'text-primary', bg: 'bg-base', minRatio: AAA_TEXT },
  { fg: 'text-primary', bg: 'bg-surface', minRatio: AAA_TEXT },
  { fg: 'text-primary', bg: 'bg-elevated', minRatio: AAA_TEXT },
  { fg: 'text-secondary', bg: 'bg-base', minRatio: AA_TEXT },
  { fg: 'text-muted', bg: 'bg-base', minRatio: AA_TEXT },
  { fg: 'text-muted', bg: 'bg-elevated', minRatio: AA_TEXT },
  { fg: 'brand-text', bg: 'bg-base', minRatio: AA_TEXT },
  { fg: 'brand-text', bg: 'bg-surface', minRatio: AA_TEXT },
  { fg: 'on-brand', bg: 'brand-fill', minRatio: AA_TEXT },
  { fg: 'on-brand', bg: 'brand-fill-hover', minRatio: AA_TEXT },
  { fg: 'focus-ring', bg: 'bg-base', minRatio: NON_TEXT },
  { fg: 'border-interactive', bg: 'bg-base', minRatio: NON_TEXT },
  ...STATUSES.flatMap((status) => [
    { fg: `text-${status}`, bg: 'bg-base', minRatio: AA_TEXT },
    { fg: `text-${status}`, bg: 'bg-elevated', minRatio: AA_TEXT },
    { fg: `text-${status}`, bg: `${status}-surface`, minRatio: AA_TEXT },
    { fg: `on-${status}`, bg: `${status}-fill`, minRatio: AA_TEXT },
    { fg: `on-${status}`, bg: `${status}-fill-hover`, minRatio: AA_TEXT }
  ])
]

// Stricter guarantees the default themes were designed for
const THEME_PAIRS: Partial<Record<ThemeName, ContrastPair[]>> = {
  light: [{ fg: 'brand-fill', bg: 'bg-base', minRatio: AAA_TEXT }],
  dark: [
    { fg: 'on-brand', bg: 'brand-fill', minRatio: AAA_TEXT },
    { fg: 'brand-text', bg: 'bg-base', minRatio: AAA_TEXT },
    { fg: 'text-secondary', bg: 'bg-base', minRatio: AAA_TEXT }
  ],
  colorblind: [
    { fg: 'brand-fill', bg: 'bg-base', minRatio: AAA_TEXT },
    { fg: 'brand-text', bg: 'bg-surface', minRatio: AAA_TEXT }
  ]
}

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
  console.log('--- Checking Token Symmetry (TOK-04) Across All Themes ---')
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
    console.log(`PASS: All ${lightTokens.size} semantic tokens are symmetrically defined across all themes.`)
  }
  return !hasErrors
}

function checkContrastPairs(themeTokens: Record<ThemeName, ThemeTokens>): boolean {
  console.log('\n--- Checking WCAG 2.2 Contrast Pairs from compiled theme tokens (A11Y-01, A11Y-02, TEST-11) ---')
  let passed = true
  let count = 0

  for (const theme of Object.keys(THEME_MIXINS) as ThemeName[]) {
    const tokens = themeTokens[theme]
    for (const pair of [...COMMON_PAIRS, ...(THEME_PAIRS[theme] ?? [])]) {
      const ratio = contrastRatio(hexOf(tokens, pair.fg, theme), hexOf(tokens, pair.bg, theme))
      count++
      if (ratio < pair.minRatio) {
        console.error(`FAIL: ${theme}: ${pair.fg} on ${pair.bg} -> ${ratio.toFixed(2)}:1 (required ≥ ${pair.minRatio}:1)`)
        passed = false
      }
    }
  }

  if (passed) console.log(`PASS: ${count} contrast pairs across ${Object.keys(THEME_MIXINS).length} themes.`)
  return passed
}

function checkPerceptualSeparation(themeTokens: Record<ThemeName, ThemeTokens>): boolean {
  console.log('\n--- Checking Brand vs Error Perceptual Separation (A11Y-03, TEST-11) ---')
  let passed = true

  for (const theme of Object.keys(THEME_MIXINS) as ThemeName[]) {
    const tokens = themeTokens[theme]
    const dE = deltaEOklab(hexOf(tokens, 'brand-text', theme), hexOf(tokens, 'text-error', theme))
    const pass = dE >= 10.0
    console.log(`${pass ? 'PASS' : 'FAIL'}: ${theme}: brand-text vs text-error ΔE(OKLab) = ${dE.toFixed(1)} (required ≥ 10.0)`)
    if (!pass) passed = false
  }

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

const PHYSICAL_PROPERTY =
  /^(?:(?:margin|padding)-(?:top|bottom|left|right)|top|left|right|bottom|border-(?:top|bottom|left|right)(?:-[a-z]+)?|(?:min-|max-)?(?:width|height))\s*:|text-align:\s*(?:left|right)|float:\s*(?:left|right)/

function checkComponentTokens(): boolean {
  console.log('\n--- Checking Component SCSS for Undefined var(--ds-*) Tokens, Hardcoded Colors & Physical Properties (TOK-01, CSS-02, CSS-03) ---')
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
    '--ds-card-accent',
    '--ds-toast-offset'
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
      // 3. Logical properties only, so layouts follow the writing direction
      if (PHYSICAL_PROPERTY.test(withoutComments)) {
        console.error(`FAIL: Physical CSS property in ${relPath}:${idx + 1} (use inset-*, *-block-*, *-inline-*, inline-size, block-size): ${trimmed}`)
        passed = false
      }
    })
  }

  if (passed) {
    console.log(`PASS: All var(--ds-*) references across ${scssFiles.length} component SCSS files are defined; no hardcoded colors or physical properties.`)
  }
  return passed
}

function run(): void {
  console.log('=== Design System Token & Contrast Verification ===\n')
  const symmetryPass = checkThemeSymmetry()
  const themeTokens = resolveThemeTokens()
  const contrastPass = checkContrastPairs(themeTokens)
  const deltaEPass = checkPerceptualSeparation(themeTokens)
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
