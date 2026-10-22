import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsDivider from './DsDivider.vue'

describe('DsDivider', () => {
  it('renders decorative horizontal solid divider by default', () => {
    const wrapper = mount(DsDivider)

    expect(wrapper.classes()).toContain('ds-divider--horizontal')
    expect(wrapper.classes()).toContain('ds-divider--solid')
    expect(wrapper.classes()).toContain('ds-divider--spacing-md')
    expect(wrapper.attributes('role')).toBe('none')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('exposes role="separator" and aria-orientation when decorative is false', () => {
    const wrapper = mount(DsDivider, {
      props: {
        decorative: false,
        orientation: 'vertical',
        variant: 'dashed',
        spacing: 'lg',
        label: 'Section Break'
      }
    })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-label')).toBe('Section Break')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.classes()).toContain('ds-divider--vertical')
    expect(wrapper.classes()).toContain('ds-divider--dashed')
    expect(wrapper.classes()).toContain('ds-divider--spacing-lg')
    expect(wrapper.classes()).toContain('ds-divider--with-label')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsDivider, { decorative: false, label: 'More Options' })
    })

    const html = await renderToString(app)
    expect(html).toContain('role="separator"')
    expect(html).toContain('More Options')
  })
})
