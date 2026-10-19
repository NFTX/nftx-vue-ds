import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsMenu from './DsMenu.vue'

describe('DsMenu', () => {
  const items = [
    { id: '1', label: 'Item One' },
    { id: '2', label: 'Item Two' },
    { id: '3', label: 'Item Three (Disabled)', disabled: true }
  ]

  it('toggles menu state and emits select event (TEST-06, A11Y-14)', async () => {
    const wrapper = mount(DsMenu, {
      props: {
        label: 'Options Menu',
        items
      }
    })

    const trigger = wrapper.find('.ds-menu-trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    // Click again to close
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')
    const menuItems = wrapper.findAll('.ds-menuitem')
    expect(menuItems).toHaveLength(3)

    // Disabled item does not emit
    await menuItems[2]?.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await menuItems[0]?.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([{ id: '1', label: 'Item One' }])
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('opens menu with ArrowDown, Enter, or Space on trigger', async () => {
    const wrapper = mount(DsMenu, {
      props: { items }
    })

    const trigger = wrapper.find('.ds-menu-trigger')

    await trigger.trigger('keydown', { key: 'ArrowDown' })
    expect(trigger.attributes('aria-expanded')).toBe('true')

    const menu = wrapper.find('.ds-menu')
    await menu.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('keydown', { key: 'Enter' })
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await menu.trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('keydown', { key: ' ' })
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('closes menu on Tab key press', async () => {
    const wrapper = mount(DsMenu, {
      props: { items },
      attachTo: document.body
    })

    const trigger = wrapper.find('.ds-menu-trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    const menu = wrapper.find('.ds-menu')
    await menu.trigger('keydown', { key: 'Tab' })
    expect(trigger.attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('handles typeahead and arrow key navigation in menu', async () => {
    const wrapper = mount(DsMenu, {
      props: { items },
      attachTo: document.body
    })

    const trigger = wrapper.find('.ds-menu-trigger')
    await trigger.trigger('click')

    const menu = wrapper.find('.ds-menu')
    // Typeahead navigation
    await menu.trigger('keydown', { key: 'i' })

    // Arrow navigation
    await menu.trigger('keydown', { key: 'ArrowDown' })

    wrapper.unmount()
  })

  it('closes when disabled prop is set to true', async () => {
    const wrapper = mount(DsMenu, {
      props: { items, disabled: false }
    })

    const trigger = wrapper.find('.ds-menu-trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await wrapper.setProps({ disabled: true })
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('handles popover toggle event (light dismiss)', async () => {
    const wrapper = mount(DsMenu, {
      props: { items },
      attachTo: document.body
    })

    const trigger = wrapper.find('.ds-menu-trigger')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    const menu = wrapper.find('.ds-menu')
    await menu.trigger('toggle')

    expect(trigger.attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsMenu, { label: 'SSR Menu', items })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-menu-container"')
    expect(html).toContain('SSR Menu')
    expect(html).toContain('popover="auto"')
  })
})
