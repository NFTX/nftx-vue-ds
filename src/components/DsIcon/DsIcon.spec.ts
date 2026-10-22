import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, h } from 'vue'
import { Check } from 'lucide-vue-next'
import DsIcon from './DsIcon.vue'
import { registerDsIcons } from './iconRegistry'

describe('DsIcon', () => {
  it('renders a Lucide icon component with aria-hidden="true" by default (TEST-06)', () => {
    const wrapper = mount(DsIcon, {
      props: {
        icon: Check
      }
    })

    expect(wrapper.classes()).toContain('ds-icon')
    expect(wrapper.classes()).toContain('ds-icon--md')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('renders an accessible icon with role="img" and aria-label when ariaLabel is provided (A11Y-04)', () => {
    const wrapper = mount(DsIcon, {
      props: {
        icon: Check,
        ariaLabel: 'Success confirmation'
      }
    })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Success confirmation')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('resolves string icon names in kebab-case or PascalCase (VUE-05)', () => {
    const wrapper = mount(DsIcon, {
      props: {
        icon: 'check'
      }
    })

    expect(wrapper.classes()).toContain('ds-icon')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('supports name prop, fallback prop, decorative prop, and registerDsIcons (DS-12)', () => {
    const CustomIcon = defineComponent({
      render: () => h('svg', { class: 'custom-registered-svg' })
    })
    registerDsIcons({ 'custom-brand': CustomIcon })

    const wrapperCustom = mount(DsIcon, {
      props: {
        name: 'custom-brand',
        decorative: true
      }
    })
    expect(wrapperCustom.find('.custom-registered-svg').exists()).toBe(true)
    expect(wrapperCustom.attributes('aria-hidden')).toBe('true')

    const wrapperFallback = mount(DsIcon, {
      props: {
        name: 'non-existent-icon',
        fallback: 'server'
      }
    })
    expect(wrapperFallback.find('svg').exists()).toBe(true)
  })

  it('applies custom numeric size as inline styles (TEST-06)', () => {
    const wrapper = mount(DsIcon, {
      props: {
        icon: Check,
        size: 32
      }
    })

    expect(wrapper.attributes('style')).toContain('inline-size: 2rem')
    expect(wrapper.attributes('style')).toContain('block-size: 2rem')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsIcon, { icon: Check, size: 'lg' })
    })

    const html = await renderToString(app)
    expect(html).toContain('ds-icon--lg')
    expect(html).toContain('aria-hidden="true"')
  })
})
