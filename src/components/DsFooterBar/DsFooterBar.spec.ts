import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsFooterBar from './DsFooterBar.vue'

describe('DsFooterBar', () => {
  it('renders semantic <footer> landmark with start, center, and end slots', () => {
    const wrapper = mount(DsFooterBar, {
      slots: {
        start: '<span>Portal Status</span>',
        center: '<span>Docs</span>',
        end: '<span>v1.1.0</span>'
      }
    })

    expect(wrapper.element.tagName).toBe('FOOTER')
    expect(wrapper.classes()).toContain('ds-footer-bar')
    expect(wrapper.classes()).toContain('ds-footer-bar--surface')
    expect(wrapper.classes()).toContain('ds-footer-bar--bordered')
    expect(wrapper.text()).toContain('Portal Status')
    expect(wrapper.text()).toContain('Docs')
    expect(wrapper.text()).toContain('v1.1.0')
  })

  it('supports variant="base", bordered=false, and default slot fallback', () => {
    const wrapper = mount(DsFooterBar, {
      props: {
        variant: 'base',
        bordered: false
      },
      slots: {
        default: '<span>Default Footer Content</span>'
      }
    })

    expect(wrapper.classes()).toContain('ds-footer-bar--base')
    expect(wrapper.classes()).not.toContain('ds-footer-bar--bordered')
    expect(wrapper.text()).toContain('Default Footer Content')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsFooterBar, null, {
          start: () => h('span', 'Homelab'),
          end: () => h('span', '2026')
        })
    })

    const html = await renderToString(app)
    expect(html).toContain('<footer')
    expect(html).toContain('Homelab')
  })
})
