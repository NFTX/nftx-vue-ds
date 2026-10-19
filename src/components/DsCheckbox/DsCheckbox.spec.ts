import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsCheckbox from './DsCheckbox.vue'

describe('DsCheckbox', () => {
  it('binds boolean v-model and toggles on click (TEST-06, A11Y-14)', async () => {
    const wrapper = mount(DsCheckbox, {
      props: {
        modelValue: false,
        label: 'Accept terms'
      }
    })

    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')
    expect(input.element.checked).toBe(false)

    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('syncs indeterminate property with DOM element (A11Y-14)', async () => {
    const wrapper = mount(DsCheckbox, {
      props: {
        indeterminate: true,
        label: 'Partial selection'
      }
    })

    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')
    expect(input.element.indeterminate).toBe(true)

    await wrapper.setProps({ indeterminate: false })
    expect(input.element.indeterminate).toBe(false)
  })

  it('supports array v-model binding with value prop (TEST-06)', async () => {
    const wrapper = mount(DsCheckbox, {
      props: {
        modelValue: ['option-a'],
        value: 'option-b',
        label: 'Option B'
      }
    })

    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')
    expect(input.element.checked).toBe(false)

    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['option-a', 'option-b']])
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsCheckbox, { label: 'SSR Checkbox', modelValue: true })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-checkbox ds-checkbox--checked"')
    expect(html).toContain('SSR Checkbox')
  })
})
