import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsCardGrid from './DsCardGrid.vue'

describe('DsCardGrid', () => {
  it('renders semantic <ul> with role="list" and default gap (TEST-06)', () => {
    const wrapper = mount(DsCardGrid, {
      slots: {
        default: () => [
          h('li', 'Item 1'),
          h('li', 'Item 2')
        ]
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('ul')
    expect(wrapper.attributes('role')).toBe('list')
    expect(wrapper.classes()).toContain('ds-card-grid--gap-md')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('supports custom tag prop', () => {
    const wrapper = mount(DsCardGrid, {
      props: {
        tag: 'div'
      },
      slots: {
        default: () => 'Direct Content'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
    expect(wrapper.attributes('role')).toBe('list')
    expect(wrapper.text()).toBe('Direct Content')
  })

  it('applies gap classes and minColWidth style correctly', () => {
    const wrapper = mount(DsCardGrid, {
      props: {
        gap: 'lg',
        minColWidth: '22rem',
        dense: true
      }
    })

    expect(wrapper.classes()).toContain('ds-card-grid--gap-lg')
    expect(wrapper.classes()).toContain('ds-card-grid--dense')
    const styleAttr = wrapper.attributes('style')
    expect(styleAttr).toContain('--ds-card-grid-min-col: 22rem')
    expect(styleAttr).toContain('--ds-grid-mode: auto-fill')
  })

  it('supports mode="auto-fit" and minCardWidth alias (DS-08, ENH-07)', () => {
    const wrapper = mount(DsCardGrid, {
      props: {
        mode: 'auto-fit',
        minCardWidth: '20rem'
      }
    })

    expect(wrapper.classes()).toContain('ds-card-grid--auto-fit')
    const styleAttr = wrapper.attributes('style')
    expect(styleAttr).toContain('--ds-grid-min-width: 20rem')
    expect(styleAttr).toContain('--ds-grid-mode: auto-fit')
  })

  it('renders items prop using scoped item slot with listitem semantics', () => {
    interface TestItem {
      id: string
      name: string
    }

    const testItems: TestItem[] = [
      { id: '1', name: 'Service A' },
      { id: '2', name: 'Service B' },
      { id: '3', name: 'Service C' }
    ]

    const wrapper = mount(DsCardGrid, {
      props: {
        items: testItems
      },
      slots: {
        item: ({ item }: { item: TestItem; index: number }) => h('span', item.name)
      }
    })

    const listItems = wrapper.findAll('.ds-card-grid__item')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]?.attributes('role')).toBe('listitem')
    expect(listItems[0]?.text()).toBe('Service A')
    expect(listItems[1]?.text()).toBe('Service B')
    expect(listItems[2]?.text()).toBe('Service C')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          DsCardGrid,
          { gap: 'xl', minColWidth: '16rem' },
          { default: () => h('li', 'SSR Grid Card') }
        )
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-card-grid ds-card-grid--gap-xl"')
    expect(html).toContain('role="list"')
    expect(html).toContain('SSR Grid Card')
  })
})
