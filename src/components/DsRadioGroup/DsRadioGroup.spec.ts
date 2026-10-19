import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsRadioGroup from './DsRadioGroup.vue'

describe('DsRadioGroup', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3 (Disabled)', value: '3', disabled: true }
  ]

  it('renders fieldset with legend and radio options (A11Y-14)', () => {
    const wrapper = mount(DsRadioGroup, {
      props: {
        legend: 'Test Group',
        options,
        modelValue: '1'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('fieldset')
    expect(wrapper.find('legend').text()).toBe('Test Group')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
    const firstRadio = radios[0]?.element as HTMLInputElement | undefined
    const secondRadio = radios[1]?.element as HTMLInputElement | undefined
    expect(firstRadio?.checked).toBe(true)
    expect(secondRadio?.checked).toBe(false)
  })

  it('updates v-model when radio selection changes (TEST-06)', async () => {
    const wrapper = mount(DsRadioGroup, {
      props: {
        legend: 'Test Group',
        options,
        modelValue: '1'
      }
    })

    const radios = wrapper.findAll('input[type="radio"]')
    await radios[1]?.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2'])
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsRadioGroup, { legend: 'SSR Radios', options, modelValue: '2' })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-radio-group__legend"')
    expect(html).toContain('SSR Radios')
    expect(html).toContain('Option 1')
  })
})
