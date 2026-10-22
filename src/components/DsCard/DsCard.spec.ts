import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsCard from './DsCard.vue'

describe('DsCard', () => {
  it('renders semantic <article> root with slots (TEST-06)', () => {
    const wrapper = mount(DsCard, {
      props: {
        variant: 'elevated',
        padding: 'lg'
      },
      slots: {
        header: () => h('h2', 'Card Header'),
        default: () => h('p', 'Card Body Content'),
        footer: () => h('button', 'Card Action')
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('article')
    expect(wrapper.classes()).toContain('ds-card--elevated')
    expect(wrapper.classes()).toContain('ds-card--padding-lg')
    expect(wrapper.find('.ds-card__header').text()).toBe('Card Header')
    expect(wrapper.find('.ds-card__body').text()).toBe('Card Body Content')
    expect(wrapper.find('.ds-card__footer').text()).toBe('Card Action')
  })

  it('renders stretched link when href is provided', () => {
    const wrapper = mount(DsCard, {
      props: {
        href: 'https://example.com/item/1'
      },
      slots: {
        default: () => 'Clickable Item'
      }
    })

    expect(wrapper.classes()).toContain('ds-card--clickable')
    const link = wrapper.find('a.ds-card__link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com/item/1')
    expect(link.text()).toBe('Clickable Item')
  })

  it('adds rel="noopener noreferrer" and screen-reader new-tab announcement when target="_blank" (DS-04)', () => {
    const wrapper = mount(DsCard, {
      props: {
        href: 'https://example.com',
        target: '_blank'
      },
      slots: {
        default: () => 'External Service'
      }
    })

    const link = wrapper.find('a.ds-card__link')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('(opens in a new tab)')
  })

  it('supports divided=false, interactive=true, and accent prop variants (ENH-05)', () => {
    const wrapper = mount(DsCard, {
      props: {
        divided: false,
        interactive: true,
        accent: 'hover'
      },
      slots: {
        header: () => 'Undivided Header',
        default: () => 'Interactive Body',
        footer: () => 'Undivided Footer'
      }
    })

    expect(wrapper.classes()).toContain('ds-card--undivided')
    expect(wrapper.classes()).toContain('ds-card--interactive')
    expect(wrapper.classes()).toContain('ds-card--clickable')
    expect(wrapper.classes()).toContain('ds-card--accent-hover')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          DsCard,
          { variant: 'glass' },
          { default: () => 'SSR Card Content' }
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-card ds-card--glass')
    expect(html).toContain('SSR Card Content')
  })
})
