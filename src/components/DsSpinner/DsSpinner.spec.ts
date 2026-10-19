import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsSpinner from './DsSpinner.vue'

describe('DsSpinner', () => {
  it('renders with role="status" and aria-live="polite" (4.1.3)', () => {
    const wrapper = mount(DsSpinner, {
      props: {
        label: 'Loading balance...'
      }
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.classes()).toContain('ds-spinner')
    expect(wrapper.classes()).toContain('ds-spinner--md')
    expect(wrapper.find('.ds-spinner__sr-text').text()).toBe('Loading balance...')
  })

  it('applies size and variant classes (TEST-06)', () => {
    const wrapper = mount(DsSpinner, {
      props: {
        size: 'lg',
        variant: 'brand'
      }
    })

    expect(wrapper.classes()).toContain('ds-spinner--lg')
    expect(wrapper.classes()).toContain('ds-spinner--brand')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsSpinner, { size: 'sm', label: 'SSR Loading' })
    })

    const html = await renderToString(app)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('SSR Loading')
  })
})
