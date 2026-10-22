import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsButton from './DsButton.vue'

describe('DsButton', () => {
  it('renders a native button with default variant and type="button" (A11Y-12)', () => {
    const wrapper = mount(DsButton, {
      slots: {
        default: 'Submit Action'
      }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toContain('ds-button--primary')
    expect(button.classes()).toContain('ds-button--md')
    expect(button.text()).toBe('Submit Action')
  })

  it('emits click event on user click (TEST-06)', async () => {
    const wrapper = mount(DsButton, {
      slots: {
        default: 'Click me'
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does NOT emit click event when disabled (TEST-10)', async () => {
    const wrapper = mount(DsButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled'
      }
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does NOT emit click event and sets aria-busy="true" when loading (A11Y-12, TEST-10)', async () => {
    const wrapper = mount(DsButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading'
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.ds-button__spinner').exists()).toBe(true)

    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders prefix and suffix slots with aria-hidden="true" (TEST-06)', () => {
    const wrapper = mount(DsButton, {
      slots: {
        prefix: '<span class="test-icon-pre">Pre</span>',
        default: 'Middle',
        suffix: '<span class="test-icon-suf">Suf</span>'
      }
    })

    expect(wrapper.find('.ds-button__prefix').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.test-icon-pre').exists()).toBe(true)
    expect(wrapper.find('.ds-button__suffix').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.test-icon-suf').exists()).toBe(true)
  })

  it('supports ariaLabel for icon-only button (A11Y-11)', () => {
    const wrapper = mount(DsButton, {
      props: {
        ariaLabel: 'Close modal'
      },
      slots: {
        prefix: '✕'
      }
    })

    expect(wrapper.attributes('aria-label')).toBe('Close modal')
    expect(wrapper.classes()).toContain('ds-button--icon-only')
  })

  it('warns in development when icon-only button omits ariaLabel (DS-13, A11Y-11)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(DsButton, {
      props: {
        iconOnly: true
      },
      slots: {
        default: '✕'
      }
    })

    expect(wrapper.classes()).toContain('ds-button--icon-only')
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Icon-only buttons require an `ariaLabel` prop')
    )
    warnSpy.mockRestore()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsButton, { variant: 'danger', size: 'lg' }, () => 'SSR Button')
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-button ds-button--danger ds-button--lg"')
    expect(html).toContain('SSR Button')
  })
})
