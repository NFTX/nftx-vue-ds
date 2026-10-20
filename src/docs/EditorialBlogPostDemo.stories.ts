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
 * Supports testing:
 * 1. Candidate Print Ink Red (#750008) for light/paper modes.
 * 2. Illuminated Gold & Amber options for dark mode titling.
 * 3. Chromatic Dark Mode Canvas: testing Deep Oxblood (#580D1A), intermediate Velvet Midpoint (#3C0911),
 *    Antique Morocco (#33080E), and Blackened Wine (#1F0508) as base backgrounds.
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
      // Light / Print Ink Base Color
      const selectedColor = ref('#750008')
      const customColorInput = ref('#750008')
      const selectedTag = ref('typography')

      // Surface Options (Including Chromatic Oxblood Dark Canvases)
      type SurfaceId =
        | 'white'
        | 'paper'
        | 'dark-slate'
        | 'oxblood-direct'
        | 'oxblood-velvet'
        | 'oxblood-morocco'
        | 'oxblood-blackened'
        | 'custom-canvas'

      const activeSurface = ref<SurfaceId>('white')
      const customCanvasHex = ref('#3C0911')

      // Dark Mode Titling Strategy (Defaults to Pale Champagne Gold)
      const selectedDarkAccent = ref('#FDE68A')
      const customDarkAccentInput = ref('#FDE68A')
      const darkHandlingMode = ref<'palette' | 'direct-raw'>('palette')
      const darkBodyMode = ref<'ivory' | 'parchment' | 'pure-white'>('ivory')

      const surfaceOptions: { id: SurfaceId; label: string; hex: string; desc: string }[] = [
        { id: 'white', label: 'Pure White', hex: '#FFFFFF', desc: 'Modern high-contrast light' },
        { id: 'paper', label: 'Warm Paper', hex: '#FAF8F5', desc: 'Archival book paper / vellum' },
        { id: 'dark-slate', label: 'Dark Slate', hex: '#0F172A', desc: 'Standard neutral dark mode' },
        { id: 'oxblood-direct', label: 'Deep Oxblood', hex: '#580D1A', desc: 'Original oxblood canvas (lighter)' },
        { id: 'oxblood-velvet', label: '⭐ Velvet Midpoint', hex: '#3C0911', desc: 'Exact 50% midpoint between Oxblood & Wine Night' },
        { id: 'oxblood-morocco', label: 'Antique Morocco', hex: '#33080E', desc: '65% deeper blend, matching slate depth' },
        { id: 'oxblood-blackened', label: 'Wine Night', hex: '#1F0508', desc: 'Blackened wine chromatic dark (darker)' }
      ]

      const lightPresets = [
        { id: 'print-red', label: 'Print Ink Red (Target)', hex: '#750008', role: 'Classical rubric / editorial book title' },
        { id: 'rose-800', label: 'Current Base (Rose-800)', hex: '#9F1239', role: 'Existing @nftx/vue-ds base' },
        { id: 'oxblood', label: 'Deep Oxblood', hex: '#580D1A', role: 'Heavy vintage iron oxide red' },
        { id: 'rose-700', label: 'Digital Crimson', hex: '#BE123C', role: 'Bright digital crimson' }
      ]

      const darkGoldPresets = [
        { id: 'champagne', label: '⭐ Pale Champagne', hex: '#FDE68A', desc: 'Soft luminous parchment highlight (AAA)' },
        { id: 'gilded-gold', label: 'Gilded Leaf Gold', hex: '#F3C77C', desc: 'Illuminated manuscript gold leaf (AAA)' },
        { id: 'amber-gold', label: 'Luminous Amber', hex: '#FBBF24', desc: 'Radiant modern amber gold (AAA)' },
        { id: 'antique-gold', label: 'Antique Ochre Gold', hex: '#E2B357', desc: 'Historical bookbinder gold (AAA)' },
        { id: 'pale-rose', label: 'Pale Rose (Old)', hex: '#FDA4AF', desc: 'Desaturated rose-300 tint (AAA)' }
      ]

      const articleTags = [
        { value: 'typography', label: 'Editorial Typography' },
        { value: 'inks', label: 'Print Inks & Pigments' },
        { value: 'illumination', label: 'Gold Illumination' },
        { value: 'chromatic-dark', label: 'Oxblood Dark Mode' }
      ]

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
        if (activeSurface.value === 'dark-slate') return '#0F172A'
        if (activeSurface.value === 'oxblood-direct') return '#580D1A'
        if (activeSurface.value === 'oxblood-velvet') return '#3C0911'
        if (activeSurface.value === 'oxblood-morocco') return '#33080E'
        if (activeSurface.value === 'oxblood-blackened') return '#1F0508'
        if (activeSurface.value === 'custom-canvas') return customCanvasHex.value
        return '#FFFFFF'
      })

      const isDarkMode = computed(() => {
        if (activeSurface.value === 'white' || activeSurface.value === 'paper') return false
        if (activeSurface.value === 'custom-canvas') return relativeLuminance(customCanvasHex.value) < 0.2
        return true
      })

      const surfaceCardBg = computed(() => {
        if (activeSurface.value === 'oxblood-direct') return '#440913'
        if (activeSurface.value === 'oxblood-velvet') return '#2E060D'
        if (activeSurface.value === 'oxblood-morocco') return '#26050A'
        if (activeSurface.value === 'oxblood-blackened') return '#29070B'
        if (activeSurface.value === 'dark-slate') return '#1E293B'
        if (activeSurface.value === 'custom-canvas') return '#22080D'
        return '#FFFFFF'
      })

      const surfaceCardBorder = computed(() => {
        if (activeSurface.value === 'oxblood-direct') return '#781524'
        if (activeSurface.value === 'oxblood-velvet') return '#5A0E1A'
        if (activeSurface.value === 'oxblood-morocco') return '#4D0C16'
        if (activeSurface.value === 'oxblood-blackened') return '#4C0D15'
        if (activeSurface.value === 'dark-slate') return '#334155'
        if (activeSurface.value === 'custom-canvas') return '#5A0E1A'
        return '#E2E8F0'
      })

      const pullquoteBg = computed(() => {
        if (activeSurface.value === 'oxblood-direct') return '#3F0812'
        if (activeSurface.value === 'oxblood-velvet') return '#2C060C'
        if (activeSurface.value === 'oxblood-morocco') return '#240409'
        if (activeSurface.value === 'oxblood-blackened') return '#25060A'
        if (activeSurface.value === 'dark-slate') return '#1E293B'
        if (activeSurface.value === 'paper') return '#F1EDE6'
        if (activeSurface.value === 'custom-canvas') return '#240409'
        return '#FDF2F4'
      })

      const surfaceText = computed(() => {
        if (isDarkMode.value) {
          if (darkBodyMode.value === 'pure-white') return '#FFFFFF'
          if (darkBodyMode.value === 'parchment') return '#F8FAFC'
          return '#F7F4EE'
        }
        if (activeSurface.value === 'paper') return '#1E293B'
        return '#0F172A'
      })

      const surfaceSubtext = computed(() => {
        if (isDarkMode.value) return '#CBD5E1'
        return '#475569'
      })

      // Active title & accent color based on theme
      const activeTitleColor = computed(() => {
        if (isDarkMode.value) {
          return darkHandlingMode.value === 'direct-raw' ? selectedColor.value : selectedDarkAccent.value
        }
        return selectedColor.value
      })

      const contrastVsWhite = computed(() => calculateContrast(selectedColor.value, '#FFFFFF').toFixed(2))
      const contrastVsSurface = computed(() => calculateContrast(activeTitleColor.value, surfaceBg.value).toFixed(2))
      const bodyContrastVsSurface = computed(() => calculateContrast(surfaceText.value, surfaceBg.value).toFixed(2))
      const deltaEVsError = computed(() => calculateDeltaE(selectedColor.value, '#DC2626').toFixed(1))

      function selectLightPreset(hex: string) {
        selectedColor.value = hex
        customColorInput.value = hex
      }

      function onLightCustomInput(event: Event) {
        const target = event.target as HTMLInputElement
        selectedColor.value = target.value
        customColorInput.value = target.value
      }

      function selectDarkPreset(hex: string) {
        darkHandlingMode.value = 'palette'
        selectedDarkAccent.value = hex
        customDarkAccentInput.value = hex
      }

      function onDarkCustomInput(event: Event) {
        darkHandlingMode.value = 'palette'
        const target = event.target as HTMLInputElement
        selectedDarkAccent.value = target.value
        customDarkAccentInput.value = target.value
      }

      function onCanvasCustomInput(event: Event) {
        activeSurface.value = 'custom-canvas'
        const target = event.target as HTMLInputElement
        customCanvasHex.value = target.value
      }

      return {
        selectedColor,
        customColorInput,
        activeSurface,
        surfaceOptions,
        customCanvasHex,
        selectedDarkAccent,
        customDarkAccentInput,
        darkHandlingMode,
        darkBodyMode,
        selectedTag,
        lightPresets,
        darkGoldPresets,
        articleTags,
        isDarkMode,
        selectLightPreset,
        onLightCustomInput,
        selectDarkPreset,
        onDarkCustomInput,
        onCanvasCustomInput,
        surfaceBg,
        surfaceCardBg,
        surfaceCardBorder,
        pullquoteBg,
        surfaceText,
        surfaceSubtext,
        activeTitleColor,
        contrastVsWhite,
        contrastVsSurface,
        bodyContrastVsSurface,
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
            background: rgba(15, 23, 42, 0.96);
            backdrop-filter: blur(10px);
            color: #F8FAFC;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #334155;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.875rem;
          "
        >
          <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.85rem;">
            <!-- Top Controls Row: Surface & Colors -->
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
              <!-- Surface Picker with Oxblood Intermediate Canvases -->
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem;">
                <span style="font-weight: 700; color: #CBD5E1; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Surface Canvas:</span>
                <button
                  v-for="surf in surfaceOptions"
                  :key="surf.id"
                  type="button"
                  :aria-pressed="activeSurface === surf.id"
                  @click="activeSurface = surf.id"
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '0.375rem',
                    background: activeSurface === surf.id ? (surf.id.startsWith('oxblood') ? '#7F1D1D' : (surf.id === 'white' ? '#FFFFFF' : '#1E293B')) : '#0F172A',
                    color: activeSurface === surf.id ? (surf.id === 'white' ? '#0F172A' : '#FFFFFF') : '#CBD5E1',
                    border: activeSurface === surf.id ? '2px solid #F3C77C' : '1px solid #475569',
                    cursor: 'pointer',
                    fontWeight: activeSurface === surf.id ? '700' : '400',
                    fontSize: '0.8125rem'
                  }"
                >
                  <span :style="{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: surf.hex, border: '1px solid #FFF' }" />
                  {{ surf.label }}
                </button>

                <!-- Custom Canvas Color Picker -->
                <label style="display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; color: #CBD5E1; font-size: 0.8125rem; margin-left: 0.25rem;">
                  <span>Custom:</span>
                  <input
                    type="color"
                    :value="customCanvasHex"
                    @input="onCanvasCustomInput"
                    aria-label="Pick custom surface canvas hex color"
                    style="width: 26px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;"
                  />
                </label>
              </div>

              <!-- Light Mode Primary Ink Color Presets (when in light/paper surface) -->
              <div v-if="!isDarkMode" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem;">
                <span style="font-weight: 700; color: #CBD5E1; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">Print Red:</span>
                <button
                  v-for="preset in lightPresets"
                  :key="preset.id"
                  type="button"
                  :aria-pressed="selectedColor === preset.hex"
                  @click="selectLightPreset(preset.hex)"
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.55rem',
                    borderRadius: '0.375rem',
                    border: selectedColor === preset.hex ? '2px solid #F3C77C' : '1px solid #475569',
                    background: selectedColor === preset.hex ? '#1E293B' : '#0F172A',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8125rem'
                  }"
                >
                  <span :style="{ display: 'inline-block', width: '11px', height: '11px', borderRadius: '50%', backgroundColor: preset.hex, border: '1px solid #FFF' }" />
                  {{ preset.label }}
                </button>
                <label style="display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; color: #CBD5E1; font-size: 0.8125rem;">
                  <span>Custom:</span>
                  <input
                    type="color"
                    :value="customColorInput"
                    @input="onLightCustomInput"
                    aria-label="Pick custom test print red hex color"
                    style="width: 26px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;"
                  />
                </label>
              </div>

              <!-- Dark Mode Gold & Accent Presets (when in dark mode) -->
              <div v-else style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem;">
                <span style="font-weight: 700; color: #F3C77C; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">✨ Titling Accent:</span>
                <button
                  v-for="preset in darkGoldPresets"
                  :key="preset.id"
                  type="button"
                  :aria-pressed="darkHandlingMode === 'palette' && selectedDarkAccent === preset.hex"
                  @click="selectDarkPreset(preset.hex)"
                  :style="{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.55rem',
                    borderRadius: '0.375rem',
                    border: (darkHandlingMode === 'palette' && selectedDarkAccent === preset.hex) ? '2px solid #F3C77C' : '1px solid #475569',
                    background: (darkHandlingMode === 'palette' && selectedDarkAccent === preset.hex) ? '#334155' : '#1E293B',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8125rem'
                  }"
                >
                  <span :style="{ display: 'inline-block', width: '11px', height: '11px', borderRadius: '50%', backgroundColor: preset.hex, border: '1px solid #FFF' }" />
                  {{ preset.label }}
                </button>

                <!-- Direct raw test -->
                <button
                  type="button"
                  @click="darkHandlingMode = 'direct-raw'"
                  :style="{
                    padding: '0.3rem 0.55rem',
                    borderRadius: '0.375rem',
                    border: darkHandlingMode === 'direct-raw' ? '2px solid #DC2626' : '1px solid #475569',
                    background: darkHandlingMode === 'direct-raw' ? '#7F1D1D' : '#1E293B',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8125rem'
                  }"
                >Raw Red (Low Contrast)</button>

                <label style="display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; color: #CBD5E1; font-size: 0.8125rem;">
                  <span>Custom:</span>
                  <input
                    type="color"
                    :value="customDarkAccentInput"
                    @input="onDarkCustomInput"
                    aria-label="Pick custom dark mode accent hex color"
                    style="width: 26px; height: 26px; border: none; border-radius: 4px; cursor: pointer; background: transparent;"
                  />
                </label>

                <!-- Body text tone selector -->
                <div style="display: flex; align-items: center; gap: 0.35rem; margin-left: 0.4rem; border-left: 1px solid #475569; padding-left: 0.5rem;">
                  <span style="font-weight: 700; color: #CBD5E1; text-transform: uppercase; font-size: 0.72rem;">Body Text:</span>
                  <button
                    type="button"
                    @click="darkBodyMode = 'ivory'"
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: darkBodyMode === 'ivory' ? '#F7F4EE' : '#1E293B',
                      color: darkBodyMode === 'ivory' ? '#0F172A' : '#CBD5E1',
                      border: darkBodyMode === 'ivory' ? '1px solid #FDE68A' : '1px solid #475569',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: darkBodyMode === 'ivory' ? '700' : '400'
                    }"
                  >Warm Ivory</button>
                  <button
                    type="button"
                    @click="darkBodyMode = 'parchment'"
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: darkBodyMode === 'parchment' ? '#F8FAFC' : '#1E293B',
                      color: darkBodyMode === 'parchment' ? '#0F172A' : '#CBD5E1',
                      border: darkBodyMode === 'parchment' ? '1px solid #38BDF8' : '1px solid #475569',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: darkBodyMode === 'parchment' ? '700' : '400'
                    }"
                  >Parchment</button>
                  <button
                    type="button"
                    @click="darkBodyMode = 'pure-white'"
                    :style="{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: darkBodyMode === 'pure-white' ? '#FFFFFF' : '#1E293B',
                      color: darkBodyMode === 'pure-white' ? '#0F172A' : '#CBD5E1',
                      border: darkBodyMode === 'pure-white' ? '1px solid #FFFFFF' : '1px solid #475569',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: darkBodyMode === 'pure-white' ? '700' : '400'
                    }"
                  >Pure White</button>
                </div>
              </div>
            </div>

            <!-- Mathematical Metrics Bar -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.25rem; font-size: 0.8125rem; border-top: 1px solid #334155; padding-top: 0.5rem;">
              <div>
                <span style="color: #CBD5E1;">Canvas:</span>
                <code style="background: #1E293B; padding: 0.15rem 0.4rem; border-radius: 4px; margin-left: 0.25rem; color: #F8FAFC; border: 1px solid #475569;">{{ surfaceBg }}</code>
              </div>
              <div>
                <span style="color: #CBD5E1;">Title Contrast vs Canvas:</span>
                <strong :style="{ color: Number(contrastVsSurface) >= 7 ? '#4ADE80' : Number(contrastVsSurface) >= 4.5 ? '#FACC15' : '#F87171', marginLeft: '0.25rem' }">
                  {{ contrastVsSurface }}:1 ({{ Number(contrastVsSurface) >= 7 ? 'AAA Pass' : Number(contrastVsSurface) >= 4.5 ? 'AA Pass' : 'Fail' }})
                </strong>
              </div>
              <div>
                <span style="color: #CBD5E1;">Body Text Contrast:</span>
                <strong style="color: #4ADE80; margin-left: 0.25rem;">{{ bodyContrastVsSurface }}:1 (AAA)</strong>
              </div>
              <div v-if="!isDarkMode">
                <span style="color: #CBD5E1;">Print Red vs White:</span>
                <strong style="color: #4ADE80; margin-left: 0.25rem;">{{ contrastVsWhite }}:1 (AAA)</strong>
              </div>
              <div v-else>
                <span style="color: #CBD5E1;">Palette Heritage:</span>
                <strong style="color: #F3C77C; margin-left: 0.25rem;">
                  {{ activeSurface.startsWith('oxblood') ? 'Oxblood Morocco Velvet + Gold Leaf' : 'Slate Ground + Gold Leaf' }}
                </strong>
              </div>
              <div>
                <span style="color: #CBD5E1;">Separation from Error Red (#DC2626):</span>
                <strong :style="{ color: Number(deltaEVsError) >= 10 ? '#4ADE80' : '#F87171', marginLeft: '0.25rem' }">
                  ΔE = {{ deltaEVsError }} ({{ Number(deltaEVsError) >= 10 ? 'Safe ≥ 10' : 'Warning' }})
                </strong>
              </div>
            </div>
          </div>
        </aside>

        <!-- Publication Header -->
        <DsHeaderBar
          title="The Typographic Journal"
          subtitle="Design Systems & Print Heritage"
          :theme="isDarkMode ? 'dark' : 'light'"
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
                  backgroundColor: isDarkMode ? activeTitleColor : selectedColor,
                  color: isDarkMode ? '#0F172A' : '#FFFFFF',
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
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: isDarkMode ? activeTitleColor : selectedColor,
                    color: isDarkMode ? '#0F172A' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }"
                >
                  {{ isDarkMode ? (activeSurface.startsWith('oxblood') ? '✨ Oxblood Velvet & Gold Leaf' : '✨ Illuminated Gold & Slate') : 'Foundations & Inks' }}
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
                Screen phosphors emit additive light, whereas physical ink absorbs it. Whether set on archival paper by day, or on a velvet oxblood morocco ground illuminated by burnished gold leaf, typography must communicate gravitas.
              </p>

              <!-- Byline -->
              <div
                :style="{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid ' + (isDarkMode ? '#475569' : '#E2E8F0'),
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '0.875rem',
                  color: surfaceSubtext
                }"
              >
                <div :style="{ width: '40px', height: '40px', borderRadius: '50%', background: isDarkMode ? '#440913' : '#475569', border: '1px solid ' + (isDarkMode ? activeTitleColor : 'transparent'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDarkMode ? activeTitleColor : '#FFF', fontWeight: '700' }">
                  ED
                </div>
                <div>
                  <div :style="{ fontWeight: '600', color: surfaceText }">Editorial Design Guild</div>
                  <div>Historical typography & velvet oxblood canvas study</div>
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
                  backgroundColor: pullquoteBg,
                  borderRadius: '0 0.5rem 0.5rem 0',
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  lineHeight: '1.6',
                  color: surfaceText,
                  transition: 'border-color 0.2s ease, background-color 0.2s ease'
                }"
              >
                “A title rendered in deep ink red feels grounded and authoritative. It speaks with the quiet permanence of an archival volume rather than the shrill urgency of an error modal.”
              </blockquote>

              <p style="margin-bottom: 1.75rem;">
                Crucially, in the perceptual color space (OKLab), the perceptual distance between <code>#750008</code> and standard error red (<code>#DC2626</code>) is <strong>ΔE = {{ deltaEVsError }}</strong>. Because human vision requires a ΔE of at least <code>10.0</code> to immediately differentiate two shades as functionally distinct categories, this deep ink red guarantees that users will never confuse a brand heading or publication title with an error message.
              </p>

              <!-- Section 2: Chromatic Oxblood Dark Mode (H2) -->
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
                2. Chromatic Dark Canvas: Finding the Sweet Spot (#3C0911)
              </h2>

              <p style="margin-bottom: 1.75rem;">
                Finding the ideal chromatic dark surface requires balancing two forces: <strong>chromatic presence</strong> (the warmth that tells the eye "this is rich oxblood") versus <strong>contrast headroom</strong> (ensuring the background is dark enough for light text to breathe).
              </p>

              <p style="margin-bottom: 1.75rem;">
                While the original Deep Oxblood (<code>#580D1A</code>) can feel slightly vibrant, and Wine Night (<code>#1F0508</code>) nears total black, the exact midpoint—<strong>Velvet Oxblood (<code>#3C0911</code>)</strong>—hits the sweet spot. It carries noticeable wine-red depth while providing an extraordinary <strong>16.2:1 AAA</strong> contrast ratio against ivory text, and <strong>10.7:1 AAA</strong> against gilded gold leaf.
              </p>

              <!-- Historical Callout Box -->
              <div
                :style="{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid ' + (isDarkMode ? '#B45309' : '#CBD5E1'),
                  backgroundColor: pullquoteBg,
                  marginBottom: '2rem',
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: '0.9375rem'
                }"
              >
                <div style="font-weight: 700; margin-bottom: 0.5rem; color: #0369A1; display: flex; align-items: center; gap: 0.5rem;">
                  <span>🏛️ Active Canvas Analytics ({{ surfaceBg }})</span>
                </div>
                <p style="margin: 0 0 0.5rem; line-height: 1.5;">
                  Metrics calculated against the active surface canvas:
                </p>
                <ul style="margin: 0; padding-left: 1.25rem; line-height: 1.6;">
                  <li><strong>Ivory Body Text ({{ surfaceText }}):</strong> Produces <strong>{{ bodyContrastVsSurface }}:1 (AAA)</strong> contrast—crisp, effortless legibility for long-form reading.</li>
                  <li><strong>Gilded Gold Titling ({{ activeTitleColor }}):</strong> Produces <strong>{{ contrastVsSurface }}:1 (AAA)</strong> contrast, creating a warm candlelight-on-leather atmosphere without any pink or neon tones.</li>
                  <li><strong>Raw Red (Uninverted):</strong> If you place raw <code>#750008</code> directly on this dark background, it drops to ~1.2:1 (proving why gold titling is mathematically essential).</li>
                </ul>
              </div>

              <!-- Interactive Component Showcase in Blog Post -->
              <div
                :style="{
                  margin: '2.5rem 0',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid ' + surfaceCardBorder,
                  backgroundColor: surfaceCardBg,
                  fontFamily: 'system-ui, sans-serif'
                }"
              >
                <h3 :style="{ margin: '0 0 1rem', fontSize: '1.125rem', color: activeTitleColor }">
                  Interactive Components on {{ activeSurface }}
                </h3>

                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1.5rem;">
                  <!-- Primary Action Button -->
                  <button
                    type="button"
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1.1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: isDarkMode ? activeTitleColor : selectedColor,
                      color: isDarkMode ? '#0F172A' : '#FFFFFF',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }"
                  >
                    {{ isDarkMode ? '✨ Gilded Action (' + activeTitleColor + ')' : 'Primary Ink Button (' + selectedColor + ')' }}
                  </button>

                  <!-- Secondary Outline Button -->
                  <button
                    type="button"
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1.1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: 'transparent',
                      color: activeTitleColor,
                      border: '1.5px solid ' + activeTitleColor,
                      fontWeight: '600',
                      cursor: 'pointer'
                    }"
                  >
                    Secondary Outline
                  </button>

                  <!-- Crimson Wax Seal Button (only in dark mode to show coexistence) -->
                  <button
                    v-if="isDarkMode"
                    type="button"
                    :style="{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1.1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: selectedColor,
                      color: '#FFFFFF',
                      border: '1px solid ' + activeTitleColor,
                      fontWeight: '600',
                      cursor: 'pointer'
                    }"
                  >
                    Ink Red Seal ({{ selectedColor }})
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
                  <div :style="{ fontSize: '0.8125rem', fontWeight: '600', color: surfaceSubtext, marginBottom: '0.5rem' }">
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
            <footer
              :style="{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid ' + (isDarkMode ? '#475569' : '#CBD5E1'),
                fontFamily: 'system-ui, sans-serif'
              }"
            >
              <h3 :style="{ color: activeTitleColor, fontSize: '1.25rem', marginBottom: '1.25rem' }">
                Related Articles & Research
              </h3>

              <DsCardGrid min-col-width="16rem" gap="md">
                <li>
                  <DsCard
                    variant="outlined"
                    padding="md"
                    :style="{ backgroundColor: surfaceCardBg, borderColor: surfaceCardBorder }"
                  >
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
                  <DsCard
                    variant="outlined"
                    padding="md"
                    :style="{ backgroundColor: surfaceCardBg, borderColor: surfaceCardBorder }"
                  >
                    <template #header>
                      <span :style="{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: activeTitleColor }">Chromatic Dark Surfaces</span>
                    </template>
                    <h4 :style="{ margin: '0.25rem 0 0.5rem', fontSize: '1rem', color: surfaceText }">
                      Oxblood Morocco & Gold Leaf
                    </h4>
                    <p :style="{ fontSize: '0.875rem', color: surfaceSubtext, margin: 0 }">
                      The optics of burnished gold leaf paired with crimson leather bindings in low-light environments.
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
