import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsTooltip from './DsTooltip.vue'

describe('DsTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('links trigger child element via aria-describedby and opens on focus', async () => {
    const wrapper = mount(DsTooltip, {
      attachTo: document.body,
      props: { content: 'Helpful hint', openDelay: 0, closeDelay: 0 },
      slots: { default: '<button type="button">Action</button>' }
    })

    const btn = wrapper.find('button')
    const tooltipId = btn.attributes('aria-describedby')
    expect(tooltipId).toMatch(/^ds-tooltip-/)

    const tooltip = wrapper.find('.ds-tooltip')
    expect(tooltip.attributes('aria-hidden')).toBe('true')

    await wrapper.find('.ds-tooltip-trigger').trigger('focusin')
    expect(tooltip.classes()).toContain('ds-tooltip--open')
    expect(tooltip.attributes('aria-hidden')).toBeUndefined()

    // Dismissible via Escape without moving focus (WCAG 2.2 SC 1.4.13)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(tooltip.classes()).not.toContain('ds-tooltip--open')

    wrapper.unmount()
  })

  it('supports hover openDelay, closeDelay, and stays open when pointer enters tooltip (SC 1.4.13 Hoverable)', async () => {
    const wrapper = mount(DsTooltip, {
      props: {
        content: 'Hoverable tooltip text',
        placement: 'bottom',
        openDelay: 100,
        closeDelay: 150
      },
      slots: { default: '<button type="button">Hover target</button>' }
    })

    const trigger = wrapper.find('.ds-tooltip-trigger')
    const tooltip = wrapper.find('.ds-tooltip')

    await trigger.trigger('mouseenter')
    expect(tooltip.classes()).not.toContain('ds-tooltip--open')

    vi.advanceTimersByTime(100)
    await wrapper.vm.$nextTick()
    expect(tooltip.classes()).toContain('ds-tooltip--open')

    // Move cursor out of trigger and into tooltip within closeDelay
    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(50)
    await tooltip.trigger('mouseenter')
    vi.advanceTimersByTime(200)
    await wrapper.vm.$nextTick()
    expect(tooltip.classes()).toContain('ds-tooltip--open')

    // Leaving tooltip closes after closeDelay
    await tooltip.trigger('mouseleave')
    vi.advanceTimersByTime(150)
    await wrapper.vm.$nextTick()
    expect(tooltip.classes()).not.toContain('ds-tooltip--open')
  })

  it('closes on focusout and supports immediate open/close when delays are 0', async () => {
    const wrapper = mount(DsTooltip, {
      props: { content: 'Zero delay', placement: 'right', openDelay: 0, closeDelay: 0 },
      slots: { default: '<button type="button">Trigger</button>' }
    })

    const trigger = wrapper.find('.ds-tooltip-trigger')
    const tooltip = wrapper.find('.ds-tooltip')

    await trigger.trigger('mouseenter')
    expect(tooltip.classes()).toContain('ds-tooltip--open')

    await trigger.trigger('mouseleave')
    expect(tooltip.classes()).not.toContain('ds-tooltip--open')

    await trigger.trigger('focusin')
    expect(tooltip.classes()).toContain('ds-tooltip--open')

    await trigger.trigger('focusout')
    expect(tooltip.classes()).not.toContain('ds-tooltip--open')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsTooltip, { content: 'SSR Tooltip', placement: 'left' }, () =>
          h('button', { type: 'button' }, 'Info')
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('SSR Tooltip')
  })
})
