import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsChipGroup from './DsChipGroup.vue'

describe('DsChipGroup', () => {
  const options = [
    { label: 'Option A', value: 'a', count: 10 },
    { label: 'Option B', value: 'b', count: 5 },
    { label: 'Option C', value: 'c', disabled: true }
  ]

  it('renders role="group" and chips with roving tabindex (TEST-06, A11Y-14)', async () => {
    const wrapper = mount(DsChipGroup, {
      props: {
        label: 'Select tags',
        options,
        modelValue: 'a'
      }
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Select tags')

    const chips = wrapper.findAll('button.ds-chip')
    expect(chips).toHaveLength(3)
    expect(chips[0]?.attributes('aria-pressed')).toBe('true')
    expect(chips[1]?.attributes('aria-pressed')).toBe('false')

    // Clicking already selected chip in single mode clears it
    await chips[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])

    // Clicking unselected chip selects it
    await chips[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['b'])

    // Disabled chip does not toggle
    await chips[2]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })

  it('prevents clearing active chip in single-select mode when allowEmpty=false and supports scrollable & variant props (ENH-06)', async () => {
    const wrapper = mount(DsChipGroup, {
      props: {
        label: 'Mandatory filter',
        chips: options,
        modelValue: 'a',
        allowEmpty: false,
        variant: 'surface',
        scrollable: true
      }
    })

    expect(wrapper.classes()).toContain('ds-chip-group--surface')
    expect(wrapper.classes()).toContain('ds-chip-group--scrollable')

    const chips = wrapper.findAll('button.ds-chip')
    // Clicking already active chip 'a' when allowEmpty=false is a no-op
    await chips[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // Clicking 'b' switches selection to 'b'
    await chips[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  it('supports multi-select array modelValue and toggles chips on and off', async () => {
    const wrapper = mount(DsChipGroup, {
      props: {
        label: 'Select multiple',
        options,
        multiple: true,
        modelValue: ['a', 'b']
      }
    })

    const chips = wrapper.findAll('button.ds-chip')
    // Remove 'a'
    await chips[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
  })

  it('navigates through chips via keyboard arrow keys', async () => {
    const wrapper = mount(DsChipGroup, {
      props: {
        options,
        modelValue: 'a'
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    const chips = wrapper.findAll('button.ds-chip')
    expect(chips[1]?.attributes('tabindex')).toBe('0')
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsChipGroup, { options, modelValue: 'b' })
    })

    const html = await renderToString(app)
    expect(html).toContain('role="group"')
    expect(html).toContain('Option A')
    expect(html).toContain('Option B')
  })
})
