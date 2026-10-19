import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsSkipLink from './DsSkipLink.vue'

describe('DsSkipLink', () => {
  it('renders default skip link element with target href (TEST-06)', () => {
    const wrapper = mount(DsSkipLink)

    expect(wrapper.element.tagName.toLowerCase()).toBe('a')
    expect(wrapper.attributes('href')).toBe('#main-content')
    expect(wrapper.text()).toBe('Skip to main content')
    expect(wrapper.classes()).toContain('ds-skip-link')
  })

  it('supports custom targetId and href props', async () => {
    const wrapper = mount(DsSkipLink, {
      props: {
        targetId: 'custom-section'
      }
    })
    expect(wrapper.attributes('href')).toBe('#custom-section')

    await wrapper.setProps({ href: '#explicit-anchor' })
    expect(wrapper.attributes('href')).toBe('#explicit-anchor')
  })

  it('renders custom slot text', () => {
    const wrapper = mount(DsSkipLink, {
      slots: {
        default: () => 'Jump to primary content'
      }
    })
    expect(wrapper.text()).toBe('Jump to primary content')
  })

  it('focuses and scrolls target element on click when target is present', async () => {
    const target = document.createElement('main')
    target.id = 'main-target'
    const scrollIntoViewSpy = vi.fn()
    target.scrollIntoView = scrollIntoViewSpy
    document.body.appendChild(target)

    const wrapper = mount(DsSkipLink, {
      props: { targetId: 'main-target' },
      attachTo: document.body
    })

    const link = wrapper.find('a')
    await link.trigger('click')

    expect(target.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(target)
    expect(scrollIntoViewSpy).toHaveBeenCalled()

    // When target loses focus, tabindex should be removed
    target.dispatchEvent(new Event('blur'))
    expect(target.hasAttribute('tabindex')).toBe(false)

    wrapper.unmount()
    target.remove()
  })

  it('preserves existing tabindex on focusable target element', async () => {
    const target = document.createElement('button')
    target.id = 'button-target'
    target.setAttribute('tabindex', '0')
    document.body.appendChild(target)

    const wrapper = mount(DsSkipLink, {
      props: { targetId: 'button-target' },
      attachTo: document.body
    })

    await wrapper.find('a').trigger('click')
    expect(target.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(target)

    wrapper.unmount()
    target.remove()
  })

  it('handles non-hash or missing target gracefully', async () => {
    const wrapper = mount(DsSkipLink, {
      props: { href: 'https://example.com' }
    })

    // Should not throw even if href is external or target doesn't exist
    await wrapper.find('a').trigger('click')
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          DsSkipLink,
          { targetId: 'content' },
          { default: () => 'Skip Navigation' }
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-skip-link"')
    expect(html).toContain('href="#content"')
    expect(html).toContain('Skip Navigation')
  })
})
