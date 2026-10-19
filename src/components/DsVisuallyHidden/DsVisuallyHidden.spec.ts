import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsVisuallyHidden from './DsVisuallyHidden.vue'

describe('DsVisuallyHidden', () => {
  it('renders a span element by default with slot content (TEST-06)', () => {
    const wrapper = mount(DsVisuallyHidden, {
      slots: {
        default: 'Screen reader announcement'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
    expect(wrapper.classes()).toContain('ds-visually-hidden')
    expect(wrapper.text()).toBe('Screen reader announcement')
  })

  it('renders custom element tag when "as" prop is specified (VUE-05)', () => {
    const wrapper = mount(DsVisuallyHidden, {
      props: {
        as: 'div'
      },
      slots: {
        default: 'Hidden block content'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
    expect(wrapper.classes()).toContain('ds-visually-hidden')
  })

  it('passes through extra attributes to the root element (TEST-06)', () => {
    const wrapper = mount(DsVisuallyHidden, {
      attrs: {
        id: 'sr-instruction',
        'data-testid': 'sr-only-text',
        'aria-live': 'polite'
      },
      slots: {
        default: 'Live region message'
      }
    })

    expect(wrapper.attributes('id')).toBe('sr-instruction')
    expect(wrapper.attributes('data-testid')).toBe('sr-only-text')
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsVisuallyHidden, { as: 'p' }, () => 'SSR Hidden Text')
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-visually-hidden"')
    expect(html).toContain('SSR Hidden Text')
    expect(html).toContain('<p')
  })
})
