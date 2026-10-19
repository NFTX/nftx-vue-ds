import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { Check } from 'lucide-vue-next'
import DsIcon from './DsIcon.vue'

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
