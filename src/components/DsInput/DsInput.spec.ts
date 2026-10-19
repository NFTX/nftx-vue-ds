import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsInput from './DsInput.vue'
import DsField from '@/components/DsField/DsField.vue'

describe('DsInput', () => {
  it('binds v-model two-way value updates (TEST-06)', async () => {
    const wrapper = mount(DsInput, {
      props: {
        modelValue: 'Initial text'
      }
    })

    const input = wrapper.find('input')
    expect(input.element.value).toBe('Initial text')

    await input.setValue('Updated text')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Updated text'])
  })

  it('passes down attributes directly to the native input element (VUE-09)', () => {
    const wrapper = mount(DsInput, {
      attrs: {
        name: 'username_field',
        'data-testid': 'custom-username-input',
        autocomplete: 'username'
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('name')).toBe('username_field')
    expect(input.attributes('data-testid')).toBe('custom-username-input')
    expect(input.attributes('autocomplete')).toBe('username')
  })

  it('inherits ID, ariaDescribedby, and ariaInvalid when nested in DsField (A11Y-10)', () => {
    const wrapper = mount(DsField, {
      props: {
        label: 'Field Label',
        hint: 'Field Hint',
        error: 'Field Error'
      },
      slots: {
        default: () => h(DsInput)
      }
    })

    const input = wrapper.find('input')
    expect(input.attributes('id')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toContain('ds-hint-')
    expect(input.attributes('aria-describedby')).toContain('ds-error-')
  })

  it('clears text and emits clear event when clear button is clicked (TEST-06)', async () => {
    const wrapper = mount(DsInput, {
      props: {
        modelValue: 'Some query',
        clearable: true
      }
    })

    const clearBtn = wrapper.find('.ds-input-wrapper__clear')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsInput, { placeholder: 'SSR Input', modelValue: 'SSR Value' })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-input-wrapper ds-input-wrapper--md"')
    expect(html).toContain('value="SSR Value"')
  })
})
