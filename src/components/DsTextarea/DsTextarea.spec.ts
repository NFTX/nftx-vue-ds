import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsTextarea from './DsTextarea.vue'

describe('DsTextarea', () => {
  it('binds v-model two-way value updates (TEST-06)', async () => {
    const wrapper = mount(DsTextarea, {
      props: {
        modelValue: 'Initial notes',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e })
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toBe('Initial notes')

    await textarea.setValue('Updated notes')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Updated notes'])
  })

  it('displays character counter and wires aria-describedby (TEST-06)', () => {
    const wrapper = mount(DsTextarea, {
      props: {
        modelValue: 'Hello',
        maxlength: 100,
        showCount: true
      }
    })

    const count = wrapper.find('.ds-textarea__count')
    expect(count.exists()).toBe(true)
    expect(count.text()).toBe('5 / 100')
    expect(wrapper.find('textarea').attributes('aria-describedby')).toContain(count.attributes('id'))
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsTextarea, { modelValue: 'SSR Text' })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-textarea-wrapper"')
    expect(html).toContain('SSR Text')
  })
})
