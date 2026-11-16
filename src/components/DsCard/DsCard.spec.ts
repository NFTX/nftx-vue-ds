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

  it('renders an overlay link named by the body when href has no title', () => {
    const wrapper = mount(DsCard, {
      props: { href: 'https://example.com/item/1' },
      slots: { default: () => 'Clickable Item' }
    })

    expect(wrapper.classes()).toContain('ds-card--clickable')
    const link = wrapper.find('a.ds-card__link')
    expect(link.attributes('href')).toBe('https://example.com/item/1')
    expect(link.classes()).toContain('ds-card__link--overlay')
    const bodyId = wrapper.find('.ds-card__body').attributes('id')
    expect(link.attributes('aria-labelledby')).toBe(bodyId)
    // Body content is not inside the link, so nested buttons stay valid
    expect(wrapper.find('.ds-card__body a').exists()).toBe(false)
  })

  it('names the overlay link with linkLabel and announces a new tab', () => {
    const wrapper = mount(DsCard, {
      props: { href: 'https://example.com', target: '_blank', linkLabel: 'Grafana' },
      slots: { default: () => '<button>Copy</button>' }
    })

    const link = wrapper.find('a.ds-card__link')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.attributes('aria-labelledby')).toBeUndefined()
    expect(link.text()).toContain('Grafana')
    expect(link.text()).toContain('(opens in a new tab)')
  })

  it('names the overlay link with body text plus the new-tab hint without linkLabel', () => {
    const wrapper = mount(DsCard, {
      props: { href: 'https://example.com', target: '_blank' },
      slots: { default: () => 'External Service' }
    })
    const ids = wrapper.find('a.ds-card__link').attributes('aria-labelledby')?.split(' ') ?? []
    expect(ids).toHaveLength(2)
    expect(wrapper.find(`#${ids[1]}`).text()).toBe('(opens in a new tab)')
  })

  it('wraps only the title in the link when there is a title', () => {
    const wrapper = mount(DsCard, {
      props: { href: '/docs', title: 'Docs', target: '_blank' },
      slots: { default: () => 'Body text' }
    })
    const link = wrapper.find('.ds-card__title a.ds-card__link')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Docs')
    expect(link.text()).toContain('(opens in a new tab)')
    expect(wrapper.findAll('a')).toHaveLength(1)
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

  it('renders title prop in header when header slot is omitted', () => {
    const wrapper = mount(DsCard, {
      props: {
        title: 'Card Section Title'
      },
      slots: {
        default: () => 'Card Body'
      }
    })

    const header = wrapper.find('.ds-card__header')
    expect(header.exists()).toBe(true)
    const titleEl = header.find('.ds-card__title')
    expect(titleEl.exists()).toBe(true)
    expect(titleEl.text()).toBe('Card Section Title')
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
