import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsKbd from './DsKbd.vue'

describe('DsKbd', () => {
  it('renders semantic <kbd> element with default slot', () => {
    const wrapper = mount(DsKbd, {
      slots: { default: 'Esc' }
    })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.text()).toBe('Esc')
    expect(wrapper.classes()).toContain('ds-kbd')
    expect(wrapper.classes()).toContain('ds-kbd--sm')
  })

  it('supports shortcut prop, size md, and ariaLabel', () => {
    const wrapper = mount(DsKbd, {
      props: {
        shortcut: '/',
        size: 'md',
        ariaLabel: 'Press slash to search'
      }
    })

    expect(wrapper.attributes('aria-label')).toBe('Press slash to search')
    expect(wrapper.text()).toBe('/')
    expect(wrapper.classes()).toContain('ds-kbd--md')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsKbd, { shortcut: '⌘K', ariaLabel: 'Command K' })
    })

    const html = await renderToString(app)
    expect(html).toContain('<kbd')
    expect(html).toContain('⌘K')
  })
})
