import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsSelect from './DsSelect.vue'
import DsField from '@/components/DsField/DsField.vue'

describe('DsSelect', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true }
  ]

  it('renders native select with options and handles v-model changes (TEST-06)', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        options,
        modelValue: '1'
      }
    })

    const select = wrapper.find('select')
    expect(select.element.value).toBe('1')

    await select.setValue('2')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2'])
  })

  it('renders placeholder option and supports sizes and explicit ariaInvalid', async () => {
    const wrapper = mount(DsSelect, {
      props: {
        placeholder: 'Choose an option',
        options,
        size: 'lg',
        ariaInvalid: true
      }
    })

    expect(wrapper.classes()).toContain('ds-select-wrapper--lg')
    expect(wrapper.classes()).toContain('ds-select-wrapper--invalid')

    const select = wrapper.find('select')
    expect(select.attributes('aria-invalid')).toBe('true')
    const placeholderOpt = wrapper.find('option[disabled]')
    expect(placeholderOpt.text()).toBe('Choose an option')

    await wrapper.setProps({ ariaInvalid: false })
    expect(select.attributes('aria-invalid')).toBe('false')
  })

  it('inherits ID, ariaDescribedby, and ariaInvalid when nested in DsField (A11Y-10)', () => {
    const wrapper = mount(DsField, {
      props: {
        label: 'Select Region',
        hint: 'Choose nearest region',
        error: 'Invalid region'
      },
      slots: {
        default: () => h(DsSelect, { options })
      }
    })

    const select = wrapper.find('select')
    expect(select.attributes('id')).toBeDefined()
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toContain('ds-hint-')
    expect(select.attributes('aria-describedby')).toContain('ds-error-')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsSelect, { options, modelValue: '2' })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-select-wrapper ds-select-wrapper--md"')
    expect(html).toContain('Option 1')
    expect(html).toContain('Option 2')
  })
})
