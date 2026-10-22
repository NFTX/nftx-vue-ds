import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsEmptyState from './DsEmptyState.vue'

describe('DsEmptyState', () => {
  it('renders semantic <section> with title and role="region" (TEST-06)', () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'No Services Found',
        description: 'Try adjusting your search query or filters.'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('section')
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.find('h3.ds-empty-state__title').text()).toBe('No Services Found')
    expect(wrapper.find('div.ds-empty-state__description').text()).toBe('Try adjusting your search query or filters.')
  })

  it('wires aria-describedby when #description slot is used without description prop (DS-05)', () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'Slot Description Only'
      },
      slots: {
        description: () => h('ul', [h('li', 'Step 1'), h('li', 'Step 2')])
      }
    })

    const descEl = wrapper.find('.ds-empty-state__description')
    expect(descEl.exists()).toBe(true)
    expect(wrapper.attributes('aria-describedby')).toBe(descEl.attributes('id'))
    expect(descEl.find('ul').exists()).toBe(true)
  })

  it('renders action CTA button and emits action event on click', async () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'Empty State',
        actionLabel: 'Create Service'
      }
    })

    const button = wrapper.find('.ds-empty-state__actions button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Create Service')

    await button.trigger('click')
    expect(wrapper.emitted('action')).toHaveLength(1)
  })

  it('supports custom headingTag prop', () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'Main Empty Section',
        headingTag: 'h2'
      }
    })

    const heading = wrapper.find('h2.ds-empty-state__title')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Main Empty Section')
  })

  it('supports card variant and icon prop', () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'No Network Bridges',
        icon: 'search',
        variant: 'card'
      }
    })

    expect(wrapper.classes()).toContain('ds-empty-state--card')
    expect(wrapper.find('.ds-empty-state__icon-wrapper').exists()).toBe(true)
  })

  it('supports custom slots for icon, title, description, and actions', () => {
    const wrapper = mount(DsEmptyState, {
      props: {
        title: 'Fallback Title'
      },
      slots: {
        icon: () => h('span', { class: 'custom-icon' }, '🌟'),
        title: () => 'Custom Slotted Title',
        description: () => 'Custom Slotted Description',
        actions: () => h('button', { class: 'custom-btn' }, 'Retry')
      }
    })

    expect(wrapper.find('.custom-icon').text()).toBe('🌟')
    expect(wrapper.find('.ds-empty-state__title').text()).toBe('Custom Slotted Title')
    expect(wrapper.find('.ds-empty-state__description').text()).toBe('Custom Slotted Description')
    expect(wrapper.find('.custom-btn').text()).toBe('Retry')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsEmptyState, {
          title: 'SSR Empty State',
          description: 'Rendered server side without errors',
          actionLabel: 'Refresh'
        })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-empty-state ds-empty-state--default"')
    expect(html).toContain('SSR Empty State')
    expect(html).toContain('Rendered server side without errors')
    expect(html).toContain('Refresh')
  })
})
