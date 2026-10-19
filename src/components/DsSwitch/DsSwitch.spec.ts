import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsSwitch from './DsSwitch.vue'

describe('DsSwitch', () => {
  it('renders button with role="switch" and aria-checked (A11Y-13)', async () => {
    const wrapper = mount(DsSwitch, {
      props: {
        modelValue: false,
        label: 'Dark Mode',
        'onUpdate:modelValue': (e: boolean) => wrapper.setProps({ modelValue: e })
      }
    })

    const btn = wrapper.find('button[role="switch"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-checked')).toBe('false')

    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('does NOT toggle when disabled (TEST-10)', async () => {
    const wrapper = mount(DsSwitch, {
      props: {
        modelValue: false,
        disabled: true,
        label: 'Locked Feature'
      }
    })

    const btn = wrapper.find('button[role="switch"]')
    expect(btn.attributes('disabled')).toBeDefined()

    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsSwitch, { label: 'SSR Switch', modelValue: true })
    })

    const html = await renderToString(app)
    expect(html).toContain('role="switch"')
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('SSR Switch')
  })
})
