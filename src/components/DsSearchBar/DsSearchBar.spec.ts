import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsSearchBar from './DsSearchBar.vue'

describe('DsSearchBar', () => {
  it('renders <search> landmark and input with search icon (A11Y-04, TEST-06)', async () => {
    const wrapper = mount(DsSearchBar, {
      props: {
        placeholder: 'Find components...',
        modelValue: 'button'
      }
    })

    expect(wrapper.element.tagName.toLowerCase()).toBe('search')
    const input = wrapper.find<HTMLInputElement>('input[type="search"]')
    expect(input.attributes('placeholder')).toBe('Find components...')
    expect(input.element.value).toBe('button')

    const clearBtn = wrapper.find('.ds-search-bar__clear')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('updates model when input value changes', async () => {
    const wrapper = mount(DsSearchBar, {
      props: {
        placeholder: 'Find...'
      }
    })

    const input = wrapper.find<HTMLInputElement>('input[type="search"]')
    input.element.value = 'hello'
    await input.trigger('input')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('emits search event when form is submitted', async () => {
    const wrapper = mount(DsSearchBar, {
      props: {
        modelValue: 'typography'
      }
    })

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')?.[0]).toEqual(['typography'])
  })

  it('focuses input on / and Meta+K hotkey press', async () => {
    const wrapperSlash = mount(DsSearchBar, {
      props: {
        hotkey: '/',
        shortcutLabel: '/'
      },
      attachTo: document.body
    })

    const inputSlash = wrapperSlash.find('input')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
    expect(document.activeElement).toBe(inputSlash.element)

    wrapperSlash.unmount()

    const wrapperK = mount(DsSearchBar, {
      props: {
        hotkey: 'k',
        shortcutLabel: '⌘K'
      },
      attachTo: document.body
    })

    const inputK = wrapperK.find('input')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(document.activeElement).toBe(inputK.element)

    // Does not focus if disabled
    await wrapperK.setProps({ disabled: true })
    inputK.element.blur()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(document.activeElement).not.toBe(inputK.element)

    wrapperK.unmount()
  })

  it('does not steal focus if user is already typing in another input element', async () => {
    const otherInput = document.createElement('input')
    document.body.appendChild(otherInput)
    otherInput.focus()
    expect(document.activeElement).toBe(otherInput)

    const wrapper = mount(DsSearchBar, {
      props: { hotkey: '/' },
      attachTo: document.body
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
    expect(document.activeElement).toBe(otherInput)

    wrapper.unmount()
    document.body.removeChild(otherInput)
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () =>
        h(DsSearchBar, {
          placeholder: 'SSR Search',
          shortcutLabel: '⌘K'
        })
    })

    const html = await renderToString(app)
    expect(html).toContain('class="ds-search-bar"')
    expect(html).toContain('placeholder="SSR Search"')
    expect(html).toContain('⌘K')
  })
})
