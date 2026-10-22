import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'
import DsCode from './DsCode.vue'

describe('DsCode', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders inline code by default with size xs', () => {
    const wrapper = mount(DsCode, {
      slots: { default: ':8080' }
    })

    expect(wrapper.find('code.ds-code__content').text()).toBe(':8080')
    expect(wrapper.classes()).toContain('ds-code--inline')
    expect(wrapper.classes()).toContain('ds-code--xs')
  })

  it('renders pre > code block when block prop is true', () => {
    const wrapper = mount(DsCode, {
      props: { block: true, size: 'sm' },
      slots: { default: 'npm run verify' }
    })

    expect(wrapper.find('pre.ds-code__pre > code.ds-code__content').exists()).toBe(true)
    expect(wrapper.classes()).toContain('ds-code--block')
    expect(wrapper.classes()).toContain('ds-code--sm')
  })

  it('copies text to clipboard and announces when copyable is true', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true
    })

    const wrapper = mount(DsCode, {
      props: { copyable: true },
      slots: { default: './setup-docker.sh' }
    })

    const copyBtn = wrapper.find('button.ds-code__copy-btn')
    expect(copyBtn.attributes('aria-label')).toBe('Copy code to clipboard')
    await copyBtn.trigger('click')

    expect(writeTextSpy).toHaveBeenCalledWith('./setup-docker.sh')
    expect(copyBtn.attributes('aria-label')).toBe('Copied to clipboard')

    vi.advanceTimersByTime(60)
    expect(document.getElementById('ds-announcer-polite')?.textContent).toBe('Copied to clipboard')

    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    expect(copyBtn.attributes('aria-label')).toBe('Copy code to clipboard')
  })

  it('uses copyText override when provided and ignores empty text', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true
    })

    const wrapper = mount(DsCode, {
      props: { copyable: true, copyText: 'custom-copy-string' },
      slots: { default: 'visible' }
    })

    const copyBtn = wrapper.find('button.ds-code__copy-btn')
    await copyBtn.trigger('click')
    expect(writeTextSpy).toHaveBeenCalledWith('custom-copy-string')

    writeTextSpy.mockClear()
    await wrapper.setProps({ copyable: true, copyText: '   ' })
    await copyBtn.trigger('click')
    expect(writeTextSpy).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('is SSR-safe and renders cleanly with renderToString (ARCH-05)', async () => {
    const app = createSSRApp({
      render: () => h(DsCode, { copyable: true, size: 'sm' }, () => 'docker ps')
    })

    const html = await renderToString(app)
    expect(html).toContain('ds-code--sm')
    expect(html).toContain('docker ps')
  })
})
