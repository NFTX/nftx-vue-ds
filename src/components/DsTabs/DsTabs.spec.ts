import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsTabs from './DsTabs.vue'

describe('DsTabs', () => {
  const tabs = [
    { id: 'tab1', label: 'Tab One' },
    { id: 'tab2', label: 'Tab Two' },
    { id: 'tab3', label: 'Tab Three', disabled: true }
  ]

  it('renders tablist and tabpanels with proper ARIA attributes (A11Y-14, TEST-06)', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        tabs,
        modelValue: 'tab1'
      },
      slots: {
        tab1: () => 'Panel 1 Content',
        tab2: () => 'Panel 2 Content'
      }
    })

    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.exists()).toBe(true)

    const renderedTabs = wrapper.findAll('[role="tab"]')
    expect(renderedTabs).toHaveLength(3)
    expect(renderedTabs[0]?.attributes('aria-selected')).toBe('true')
    expect(renderedTabs[1]?.attributes('aria-selected')).toBe('false')

    await renderedTabs[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2'])

    // Clicking disabled tab does not emit
    await renderedTabs[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('initializes with first tab when modelValue is empty', async () => {
    const wrapper = mount(DsTabs, {
      props: { tabs }
    })

    const renderedTabs = wrapper.findAll('[role="tab"]')
    expect(renderedTabs[0]?.attributes('aria-selected')).toBe('true')

    await wrapper.setProps({ modelValue: 'tab2' })
    expect(renderedTabs[1]?.attributes('aria-selected')).toBe('true')
  })

  it('supports vertical orientation', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        tabs,
        orientation: 'vertical',
        modelValue: 'tab1'
      }
    })

    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.find('.ds-tabs').classes()).toContain('ds-tabs--vertical')
  })

  it('automatically selects tab on arrow key focus in automatic mode', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        tabs,
        modelValue: 'tab1',
        manual: false
      }
    })

    const tablist = wrapper.find('[role="tablist"]')
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2'])
  })

  it('requires Enter or Space in manual mode', async () => {
    const wrapper = mount(DsTabs, {
      props: {
        tabs,
        modelValue: 'tab1',
        manual: true
      }
    })

    const tablist = wrapper.find('[role="tablist"]')
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    // In manual mode, arrow right moves focus but does not change modelValue yet
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await tablist.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tab2'])
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsTabs, { tabs, modelValue: 'tab1' }, { tab1: () => 'SSR Panel 1' })
    })

    const html = await renderToString(app)
    expect(html).toContain('role="tablist"')
    expect(html).toContain('Tab One')
    expect(html).toContain('SSR Panel 1')
  })
})
