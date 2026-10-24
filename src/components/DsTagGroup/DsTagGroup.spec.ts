import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DsTagGroup from './DsTagGroup.vue'

describe('DsTagGroup', () => {
  it('renders a list of tags', () => {
    const wrapper = mount(DsTagGroup, {
      props: {
        tags: ['São Paulo', 'Educação', 'Economia']
      }
    })

    const tags = wrapper.findAll('.ds-tag')
    expect(tags.length).toBe(3)
    expect(tags[0]!.text()).toContain('São Paulo')
    expect(tags[1]!.text()).toContain('Educação')
    expect(tags[2]!.text()).toContain('Economia')
  })

  it('allows removing tags when editable is true', async () => {
    const wrapper = mount(DsTagGroup, {
      props: {
        modelValue: ['São Paulo', 'Educação'],
        editable: true
      }
    })

    const removeButtons = wrapper.findAll('.ds-tag__remove')
    expect(removeButtons.length).toBe(2)

    await removeButtons[0]!.trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')?.[0]).toEqual([0, 'São Paulo'])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Educação']])
  })

  it('allows adding tags via inline input', async () => {
    const wrapper = mount(DsTagGroup, {
      props: {
        modelValue: ['São Paulo'],
        editable: true
      }
    })

    const addBtn = wrapper.find('.ds-tag-group__add-btn')
    expect(addBtn.exists()).toBe(true)

    await addBtn.trigger('click')
    const input = wrapper.find('.ds-tag-group__input')
    expect(input.exists()).toBe(true)

    await input.setValue('Campinas')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')?.[0]).toEqual(['Campinas'])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['São Paulo', 'Campinas']])
  })
})
