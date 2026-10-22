import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import type { DsTheme } from '@/composables/useTheme'
import DsThemeToggle from './DsThemeToggle.vue'

describe('DsThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders icon-only button by default and cycles through light, dark, and colorblind (ENH-01, TEST-06)', async () => {
    const wrapper = mount(DsThemeToggle, {
      props: {
        modelValue: 'light' as DsTheme
      }
    })

    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toContain('Current theme: Light')
    expect(btn.attributes('aria-label')).toContain('Activate to switch to Dark theme')

    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['dark'])
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    await wrapper.setProps({ modelValue: 'dark' })

    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['colorblind'])
    expect(document.documentElement.getAttribute('data-theme')).toBe('colorblind')
    await wrapper.setProps({ modelValue: 'colorblind' })

    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual(['light'])
  })

  it('supports showLabel, custom labels, availableThemes alias, and outline variant', () => {
    const wrapper = mount(DsThemeToggle, {
      props: {
        modelValue: 'colorblind',
        showLabel: true,
        variant: 'outline',
        size: 'sm',
        availableThemes: ['light', 'colorblind'],
        labels: { colorblind: 'High Contrast CVD' }
      }
    })

    expect(wrapper.find('.ds-theme-toggle__label').text()).toBe('High Contrast CVD')
    expect(wrapper.attributes('aria-label')).toContain('Current theme: High Contrast CVD')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsThemeToggle, { modelValue: 'light', showLabel: true })
    })

    const html = await renderToString(app)
    expect(html).toContain('ds-theme-toggle')
    expect(html).toContain('Light')
  })
})
