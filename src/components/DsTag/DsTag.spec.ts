import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { Tag } from 'lucide-vue-next'
import DsTag from './DsTag.vue'

describe('DsTag', () => {
  it('renders label and default classes', () => {
    const wrapper = mount(DsTag, {
      slots: { default: 'homelab' }
    })

    expect(wrapper.text()).toContain('homelab')
    expect(wrapper.classes()).toContain('ds-tag--subtle')
    expect(wrapper.classes()).toContain('ds-tag--sm')
    expect(wrapper.classes()).toContain('ds-tag--shape-rounded')
  })

  it('supports variant, size, and shape props', () => {
    const wrapper = mount(DsTag, {
      props: {
        variant: 'surface',
        size: 'md',
        shape: 'pill'
      },
      slots: { default: 'featured' }
    })

    expect(wrapper.classes()).toContain('ds-tag--surface')
    expect(wrapper.classes()).toContain('ds-tag--md')
    expect(wrapper.classes()).toContain('ds-tag--shape-pill')
  })

  it('renders prefix text when provided', () => {
    const wrapper = mount(DsTag, {
      props: { prefix: '#' },
      slots: { default: 'vue' }
    })

    const prefix = wrapper.find('.ds-tag__prefix')
    expect(prefix.exists()).toBe(true)
    expect(prefix.text()).toBe('#')
    expect(prefix.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toContain('vue')
  })

  it('renders icon by name or component', async () => {
    const wrapper = mount(DsTag, {
      props: { icon: 'Tag' },
      slots: { default: 'tagged' }
    })

    expect(wrapper.find('.ds-tag__icon').exists()).toBe(true)

    await wrapper.setProps({ icon: Tag })
    expect(wrapper.find('.ds-tag__icon').exists()).toBe(true)
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsTag, { prefix: '#', variant: 'subtle' }, () => 'ssr-tag')
    })

    const html = await renderToString(app)
    expect(html).toContain('ds-tag--subtle')
    expect(html).toContain('ssr-tag')
  })
})
