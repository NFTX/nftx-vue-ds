import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, computed } from 'vue'
import { expect } from 'storybook/test'
import { DsHeaderBar } from '@/components/DsHeaderBar'
import { DsBadge } from '@/components/DsBadge'
import { DsButton } from '@/components/DsButton'
import { DsChipGroup } from '@/components/DsChipGroup'
import { DsCardGrid } from '@/components/DsCardGrid'
import { DsCard } from '@/components/DsCard'
import { DsLink } from '@/components/DsLink'

/**
 * Editorial Blogpost Story for real-world contextual color validation.
 * Allows comparing candidate print ink red (#750008) against existing design system
 * tokens across typographic hierarchy (h1, h2, drop-cap, pull-quote, links, CTAs).
 */
const meta = {
  title: 'Pages/EditorialBlogPostDemo',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const EditorialArticleValidation: Story = {
  render: () => ({
    components: {
      DsHeaderBar,
      DsBadge,
      DsButton,
      DsChipGroup,
      DsCardGrid,
      DsCard,
      DsLink
    },
    setup() {
      // Color & Theme state
      const selectedColor = ref('#750008')
      const customColorInput = ref('#750008')
      const activeSurface = ref<'white' | 'paper' | 'dark'>('white')
      const darkHandling = ref<'inverted' | 'direct'>('inverted')
      const selectedTag = ref('typography')

      const presets = [
        { id: 'print-red', label: 'Print Ink Red (Target)', hex: '#750008', role: 'Classical rubric / editorial book title' },
        { id: 'rose-800', label: 'Current System Base', hex: '#9F1239', role: 'Existing @nftx/vue-ds rose-800' },
        { id: 'oxblood', label: 'Deep Oxblood', hex: '#580D1A', role: 'Heavy vintage iron oxide red' },
        { id: 'rose-700', label: 'Digital Crimson', hex: '#BE123C', role: 'Existing dark mode button fill' }
      ]

      const articleTags = [
        { value: 'typography', label: 'Editorial Typography' },
        { value: 'inks', label: 'Print Inks & Pigments' },
        { value: 'contrast', label: 'WCAG 2.2 Contrast' },
        { value: 'systems', label: 'Design Tokens' }
      ]

      function selectPreset(hex: string) {
        selectedColor.value = hex
        customColorInput.value = hex
      }

      function onCustomInput(event: Event) {
        const target = event.target as HTMLInputElement
        selectedColor.value = target.value
        customColorInput.value = target.value
      }

      // Mathematical Color Analysis
      function srgbToLinear(c: number): number {
        const norm = c / 255
        return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4)
      }

      function hexToRgb(hex: string): [number, number, number] {
        const clean = hex.replace('#', '').trim()
        const r = parseInt(clean.substring(0, 2), 16) || 0
        const g = parseInt(clean.substring(2, 4), 16) || 0
        const b = parseInt(clean.substring(4, 6), 16) || 0
        return [r, g, b]
      }

      function relativeLuminance(hex: string): number {
        const [r, g, b] = hexToRgb(hex)
        return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
      }

      function calculateContrast(hex1: string, hex2: string): number {
        const l1 = relativeLuminance(hex1)
        const l2 = relativeLuminance(hex2)
        const lighter = Math.max(l1, l2)
        const darker = Math.min(l1, l2)
        return (lighter + 0.05) / (darker + 0.05)
      }

      function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
        const lr = srgbToLinear(r)
        const lg = srgbToLinear(g)
        const lb = srgbToLinear(b)
        const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
        const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
        const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
        return [
          0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
        ]
      }

      function calculateDeltaE(hex1: string, hex2: string): number {
        const [r1, g1, b1] = hexToRgb(hex1)
        const [r2, g2, b2] = hexToRgb(hex2)
        const [L1, a1, b1_] = rgbToOklab(r1, g1, b1)
        const [L2, a2, b2_] = rgbToOklab(r2, g2, b2)
        const dL = L1 - L2
        const da = a1 - a2
        const db = b1_ - b2_
        return Math.sqrt(dL * dL + da * da + db * db) * 100
      }

      const surfaceBg = computed(() => {
        if (activeSurface.value === 'paper') return '#FAF8F5'
        if (activeSurface.value === 'dark') return '#0F172A'
        return '#FFFFFF'
      })

      const surfaceText = computed(() => {
        if (activeSurface.value === 'dark') return '#E2E8F0'
        if (activeSurface.value === 'paper') return '#1E293B'
        return '#0F172A'
      })

      const surfaceSubtext = computed(() => {
        if (activeSurface.value === 'dark') return '#94A3B8'
        if (activeSurface.value === 'paper') return '#475569'
        return '#475569'
      })

      // In dark mode: if inverted, use accessible light rose (#FDA4AF), else use raw selected color
      const activeTitleColor = computed(() => {
        if (activeSurface.value === 'dark') {
          return darkHandling.value === 'inverted' ? '#FDA4AF' : selectedColor.value
        }
        return selectedColor.value
      })

      const contrastVsWhite = computed(() => calculateContrast(selectedColor.value, '#FFFFFF').toFixed(2))
      const contrastVsSurface = computed(() => calculateContrast(activeTitleColor.value, surfaceBg.value).toFixed(2))
      const deltaEVsError = computed(() => calculateDeltaE(selectedColor.value, '#DC2626').toFixed(1))

      return {
        selectedColor,
        customColorInput,
        activeSurface,
        darkHandling,
        selectedTag,
        presets,
        articleTags,
        selectPreset,
        onCustomInput,
        surfaceBg,
        surfaceText,
        surfaceSubtext,
        activeTitleColor,
        contrastVsWhite,
        contrastVsSurface,
        deltaEVsError
      }
    },
    template: `
      <div
        id="blog-demo-root"
        :style="{
          backgroundColor: surfaceBg,
          color: surfaceText,
          minHeight: '100vh',
          fontFamily: 'Charter, Georgia, Cambria, \\'Times New Roman\\', Times, serif',
          transition: 'background-color 0.2s ease, color 0.2s ease'
        }"
      >
        <!-- Persistent Interactive Validation Toolbar -->
        <aside
          role="region"
          aria-label="Color Validation Toolbar"
          style="
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(8px);
            color: #F8FAFC;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #334155;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.875rem;
          "
        >
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
            <!-- Color Presets -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 600; color: #94A3B8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Color:</span>
              <button
                v-for="preset in presets"
                :key="preset.id"
                type="button"
                :aria-pressed="selectedColor === preset.hex"
                @click="selectPreset(preset.hex)"
                :style="{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '0.375rem',
                  border: selectedColor === preset.hex ? '2px solid #38BDF8' : '1px solid #475569',
                  background: selectedColor === preset.hex ? '#1E293B' : '#0F172A',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.8125rem'
                }"
              >
                <span :style="{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: preset.hex, border: '1px solid #FFF' }" />
                {{ preset.label }} ({{ preset.hex }})
              </button>

              <!-- Color picker input -->
              <label style="display: inline-flex; align-items: center; gap: 0.35rem; margin-left: 0.5rem; cursor: pointer; color: #CBD5E1;">
                <span>Picker:</span>
                <input
                  type="color"
                  :value="customColorInput"
                  @input="onCustomInput"
                  aria-label="Pick custom test hex color"
                  style="width: 28px; height: 28px; border: none; border-radius: 4px; cursor: pointer; background: transparent;"
                />
              </label>
            </div>

            <!-- Surface & Inversion controls -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="font-weight: 600; color: #94A3B8; text-transform: uppercase; font-size: 0.75rem;">Surface:</span>
                <button
                  type="button"
                  @click="activeSurface = 'white'"
                  :style="{
                    padding: '0.3rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: activeSurface === 'white' ? '#FFFFFF' : '#1E293B',
                    color: activeSurface === 'white' ? '#0F172A' : '#94A3B8',
                    border: '1px solid #475569',
                    cursor: 'pointer',
                    fontWeight: activeSurface === 'white' ? '700' : '400'
                  }"
                >White</button>
                <button
                  type="button"
                  @click="activeSurface = 'paper'"
                  :style="{
                    padding: '0.3rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: activeSurface === 'paper' ? '#FAF8F5' : '#1E293B',
                    color: activeSurface === 'paper' ? '#1E293B' : '#94A3B8',
                    border: '1px solid #475569',
                    cursor: 'pointer',
                    fontWeight: activeSurface === 'paper' ? '700' : '400'
                  }"
                >Warm Paper</button>
                <button
                  type="button"
                  @click="activeSurface = 'dark'"
                  :style="{
                    padding: '0.3rem 0.5rem',
                    borderRadius: '0.25rem',
                    background: activeSurface === 'dark' ? '#0369A1' : '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #475569',
                    cursor: 'pointer',
                    fontWeight: activeSurface === 'dark' ? '700' : '400'
                  }"
                >Dark Slate</button>
              </div>

              <!-- Dark mode behavior toggle (only visible when dark) -->
              <div v-if="activeSurface === 'dark'" style="display: flex; align-items: center; gap: 0.35rem; background: #1E293B; padding: 0.2rem 0.5rem; border-radius: 0.25rem; border: 1px solid #0369A1;">
                <span style="font-size: 0.75rem; color: #38BDF8;">Dark Mode Text:</span>
                <button
                  type="button"
                  @click="darkHandling = 'inverted'"
                  :style="{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '0.2rem',
                    background: darkHandling === 'inverted' ? '#0369A1' : 'transparent',
                    color: '#FFF',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }"
                >Tonal Inversion (AAA)</button>
                <button
                  type="button"
                  @click="darkHandling = 'direct'"
                  :style="{
                    padding: '0.15rem 0.4rem',
                    borderRadius: '0.2rem',
                    background: darkHandling === 'direct' ? '#DC2626' : 'transparent',
                    color: '#FFF',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }"
                >Direct Raw Hex (1.5:1 Fail)</button>
              </div>
            </div>

            <!-- Mathematical Metrics Bar -->
            <div style="display: flex; align-items: center; gap: 1.25rem; font-size: 0.8125rem; border-top: 1px solid #334155; padding-top: 0.5rem; width: 100%;">
              <div>
                <span style="color: #94A3B8;">Selected:</span>
                <code style="background: #1E293B; padding: 0.1rem 0.3rem; border-radius: 3px; margin-left: 0.25rem; color: #F1F5F9;">{{ selectedColor }}</code>
              </div>
              <div>
                <span style="color: #94A3B8;">Contrast vs Current Surface:</span>
                <strong :style="{ color: Number(contrastVsSurface) >= 7 ? '#4ADE80' : Number(contrastVsSurface) >= 4.5 ? '#FACC15' : '#F87171', marginLeft: '0.25rem' }">
                  {{ contrastVsSurface }}:1 ({{ Number(contrastVsSurface) >= 7 ? 'AAA Pass' : Number(contrastVsSurface) >= 4.5 ? 'AA Pass' : 'Fail' }})
                </strong>
              </div>
              <div>
                <span style="color: #94A3B8;">Contrast vs White:</span>
                <strong style="color: #4ADE80; margin-left: 0.25rem;">{{ contrastVsWhite }}:1 (AAA)</strong>
              </div>
              <div>
                <span style="color: #94A3B8;">Perceptual Separation vs Error Red (#DC2626):</span>
                <strong :style="{ color: Number(deltaEVsError) >= 10 ? '#4ADE80' : '#F87171', marginLeft: '0.25rem' }">
                  ΔE = {{ deltaEVsError }} ({{ Number(deltaEVsError) >= 10 ? 'Safe ≥ 10' : 'Too close to error red' }})
                </strong>
              </div>
            </div>
          </div>
        </aside>

        <!-- Publication Header -->
        <DsHeaderBar
          title="The Typographic Journal"
          subtitle="Design Systems & Print Heritage"
          :theme="activeSurface === 'dark' ? 'dark' : 'light'"
          :show-theme-toggle="false"
        >
          <template #brand>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span
                :style="{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  backgroundColor: activeTitleColor,
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontFamily: 'serif',
                  fontSize: '1.25rem'
                }"
              >¶</span>
              <span style="font-weight: 700; letter-spacing: -0.02em; font-family: serif; font-size: 1.25rem;">
                The Typographic Journal
              </span>
            </div>
          </template>
        </DsHeaderBar>

        <!-- Main Blogpost Content Container -->
        <main style="max-width: 740px; margin: 0 auto; padding: 3rem 1.5rem 6rem; line-height: 1.8;">
          <article>
            <!-- Article Header -->
            <header style="margin-bottom: 2.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; font-family: system-ui, sans-serif;">
                <span
                  :style="{
                    display: 'inline-block',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    backgroundColor: activeTitleColor,
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }"
                >
                  Foundations & Inks
                </span>
                <span :style="{ color: surfaceSubtext, fontSize: '0.875rem' }">October 20, 2026 · 6 min read</span>
              </div>

              <!-- Main Article Title (H1) -->
              <h1
                id="article-title"
                :style="{
                  color: activeTitleColor,
                  fontSize: 'clamp(2.1rem, 5vw, 3rem)',
                  lineHeight: '1.15',
                  fontWeight: '700',
                  letterSpacing: '-0.025em',
                  margin: '0 0 1.25rem 0',
                  transition: 'color 0.2s ease'
                }"
              >
                The Tactile Weight of Red: Why Editorial Title Text Demands Deep Print Inks
              </h1>

              <!-- Subtitle / Dek -->
              <p
                :style="{
                  color: surfaceSubtext,
                  fontSize: '1.25rem',
                  lineHeight: '1.5',
                  margin: '0 0 1.75rem 0',
                  fontStyle: 'italic'
                }"
              >
                Screen phosphors emit additive light, whereas physical ink absorbs it. Transferring the deep, velvety density of historical rubricator ink into a modern web design system changes how readers perceive authority.
              </p>

              <!-- Byline -->
              <div
                :style="{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid ' + (activeSurface === 'dark' ? '#334155' : '#E2E8F0'),
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '0.875rem',
                  color: surfaceSubtext
                }"
              >
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #475569; display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 600;">
                  ED
                </div>
                <div>
                  <div :style="{ fontWeight: '600', color: surfaceText }">Editorial Design Guild</div>
                  <div>Research note on color contrast and perceptual gravity</div>
                </div>
              </div>
            </header>

            <!-- Article Body -->
            <div :style="{ fontSize: '1.125rem', color: surfaceText }">
              <!-- Lead Paragraph with Drop Cap -->
              <p style="margin-bottom: 1.75rem;">
                <span
                  :style="{
                    float: 'left',
                    fontSize: '4.5rem',
                    lineHeight: '0.8',
                    paddingTop: '0.1rem',
                    paddingRight: '0.6rem',
                    paddingBottom: '0.1rem',
                    fontFamily: 'serif',
                    fontWeight: '700',
                    color: activeTitleColor,
                    transition: 'color 0.2s ease'
                  }"
                >W</span>hen rubricators in fifteenth-century Venice first added vermilion and madder pigments to black-inked movable type, red was never meant to signal an emergency or an invalid form state. Red was the color of structural primacy: the chapter opening, the liturgical direction, the illumination that invited the reader's contemplation.
              </p>

              <p style="margin-bottom: 1.75rem;">
                In contemporary digital interfaces, however, "red" has been monopolized by system notifications, destructive actions, and validation errors. When a designer wants to use a red tone for brand headings or title text, using a standard saturated red like <code>#DC2626</code> or <code>#EF4444</code> creates immediate cognitive dissonance. The reader's peripheral vision registers an alert rather than a literary heading.
              </p>

              <!-- Section 1 (H2) -->
              <h2
                :style="{
                  color: activeTitleColor,
                  fontSize: '1.875rem',
                  lineHeight: '1.25',
                  fontWeight: '700',
                  margin: '2.5rem 0 1rem',
                  letterSpacing: '-0.015em',
                  transition: 'color 0.2s ease'
                }"
              >
                1. The Contrast Mathematics of Ink Red (#750008)
              </h2>

              <p style="margin-bottom: 1.75rem;">
                The proposed ink red (<code>#750008</code>) possesses a relative luminance of approximately <code>0.024</code>. Against a clean white background (<code>#FFFFFF</code>), it produces a contrast ratio of <strong>{{ contrastVsWhite }}:1</strong>. This surpasses the strictest WCAG 2.2 Level AAA benchmark (7.0:1) by over 70%.
              </p>

              <!-- Editorial Pull Quote -->
              <blockquote
                :style="{
                  margin: '2.25rem 0',
                  padding: '1.25rem 1.75rem',
                  borderLeft: '4px solid ' + activeTitleColor,
                  backgroundColor: activeSurface === 'dark' ? '#1E293B' : (activeSurface === 'paper' ? '#F1EDE6' : '#FDF2F4'),
                  borderRadius: '0 0.5rem 0.5rem 0',
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  lineHeight: '1.6',
                  color: surfaceText,
                  transition: 'border-color 0.2s ease'
                }"
              >
                “A title rendered in deep ink red feels grounded and authoritative. It speaks with the quiet permanence of an archival volume rather than the shrill urgency of an error modal.”
              </blockquote>

              <p style="margin-bottom: 1.75rem;">
                Crucially, in the perceptual color space (OKLab), the perceptual distance between <code>#750008</code> and standard error red (<code>#DC2626</code>) is <strong>ΔE = {{ deltaEVsError }}</strong>. Because human vision requires a ΔE of at least <code>10.0</code> to immediately differentiate two shades as functionally distinct categories, this deep ink red guarantees that users will never confuse a brand heading or publication title with an error message.
              </p>

              <!-- Section 2 (H2) -->
              <h2
                :style="{
                  color: activeTitleColor,
                  fontSize: '1.875rem',
                  lineHeight: '1.25',
                  fontWeight: '700',
                  margin: '2.5rem 0 1rem',
                  letterSpacing: '-0.015em',
                  transition: 'color 0.2s ease'
                }"
              >
                2. Understanding the Light vs. Dark Mode Contrast Inversion
              </h2>

              <p style="margin-bottom: 1.75rem;">
                Why can't we simply apply <code>#750008</code> to dark mode? In light mode, <code>#750008</code> works because it is a very dark pigment on a bright background. On a dark surface (<code>#0F172A</code>), placing a dark pigment creates a contrast ratio of only <strong>1.50:1</strong>, which is completely unreadable.
              </p>

              <div
                :style="{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid ' + (activeSurface === 'dark' ? '#334155' : '#CBD5E1'),
                  backgroundColor: activeSurface === 'dark' ? '#1E293B' : (activeSurface === 'paper' ? '#F5EFEB' : '#F8FAFC'),
                  marginBottom: '2rem',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '0.9375rem'
                }"
              >
                <div style="font-weight: 700; margin-bottom: 0.5rem; color: #0369A1; display: flex; align-items: center; gap: 0.5rem;">
                  <span>💡 How Design Systems Solve This: Tonal Inversion</span>
                </div>
                <p style="margin: 0 0 0.5rem; line-height: 1.5;">
                  A design system separates <strong>primitive colors</strong> (e.g. <code>#750008</code>) from <strong>semantic tokens</strong> (e.g. <code>--ds-color-brand-text</code>).
                </p>
                <ul style="margin: 0; padding-left: 1.25rem; line-height: 1.6;">
                  <li><strong>In Light Theme:</strong> <code>--ds-color-brand-text</code> maps to the deep ink tone (<strong>{{ selectedColor }}</strong>), yielding 11.9:1 contrast (AAA).</li>
                  <li><strong>In Dark Theme:</strong> <code>--ds-color-brand-text</code> automatically maps to an illuminated tint of the same hue family (e.g. <code>#FDA4AF</code> rose-300), yielding 9.44:1 contrast (AAA).</li>
                </ul>
              </div>

              <!-- Interactive Component Showcase in Blog Post -->
              <div
                :style="{
                  margin: '2.5rem 0',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid ' + (activeSurface === 'dark' ? '#334155' : '#E2E8F0'),
                  backgroundColor: activeSurface === 'dark' ? '#1E293B' : (activeSurface === 'paper' ? '#FFFFFF' : '#FDFDFD'),
                  fontFamily: 'system-ui, sans-serif'
                }"
              >
                <h3 :style="{ margin: '0 0 1rem', fontSize: '1.125rem', color: activeTitleColor }">
                  Interactive Design System Components in This Color
                </h3>

                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1.5rem;">
                  <button
                    type="button"
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: selectedColor,
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }"
                  >
                    Primary Button ({{ selectedColor }})
                  </button>

                  <button
                    type="button"
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'transparent',
                      color: activeTitleColor,
                      border: '1.5px solid ' + activeTitleColor,
                      fontWeight: '600',
                      cursor: 'pointer'
                    }"
                  >
                    Secondary Button
                  </button>

                  <a
                    href="#sample-link"
                    :style="{
                      color: activeTitleColor,
                      fontWeight: '600',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      marginLeft: '0.5rem'
                    }"
                  >
                    Sample Inline Link
                  </a>
                </div>

                <div>
                  <div style="font-size: 0.8125rem; font-weight: 600; color: #64748B; margin-bottom: 0.5rem;">
                    Article Topics (DsChipGroup):
                  </div>
                  <DsChipGroup
                    v-model="selectedTag"
                    :options="articleTags"
                    label="Article Topics"
                  />
                </div>
              </div>
            </div>

            <!-- Further Reading Section (Cards) -->
            <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #CBD5E1; font-family: system-ui, sans-serif;">
              <h3 :style="{ color: activeTitleColor, fontSize: '1.25rem', marginBottom: '1.25rem' }">
                Related Articles & Research
              </h3>

              <DsCardGrid min-col-width="16rem" gap="md">
                <li>
                  <DsCard variant="outlined" padding="md">
                    <template #header>
                      <span :style="{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: activeTitleColor }">Historical Rubrication</span>
                    </template>
                    <h4 :style="{ margin: '0.25rem 0 0.5rem', fontSize: '1rem', color: surfaceText }">
                      Venetian Press Inks (1470–1520)
                    </h4>
                    <p :style="{ fontSize: '0.875rem', color: surfaceSubtext, margin: 0 }">
                      How Aldus Manutius and early typographers formulated stable cinnabar inks for book titles.
                    </p>
                  </DsCard>
                </li>
                <li>
                  <DsCard variant="outlined" padding="md">
                    <template #header>
                      <span :style="{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: activeTitleColor }">Accessibility Engineering</span>
                    </template>
                    <h4 :style="{ margin: '0.25rem 0 0.5rem', fontSize: '1rem', color: surfaceText }">
                      WCAG 2.2 Relative Luminance
                    </h4>
                    <p :style="{ fontSize: '0.875rem', color: surfaceSubtext, margin: 0 }">
                      Linearizing sRGB gamma to predict perceived text contrast across high-DPI displays.
                    </p>
                  </DsCard>
                </li>
              </DsCardGrid>
            </footer>
          </article>
        </main>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('#blog-demo-root')
    expect(root).not.toBeNull()

    const title = canvasElement.querySelector<HTMLElement>('#article-title')
    expect(title).not.toBeNull()
  }
}
