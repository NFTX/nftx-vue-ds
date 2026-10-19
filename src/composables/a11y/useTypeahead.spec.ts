// src/composables/a11y/useTypeahead.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTypeahead } from './useTypeahead'

describe('useTypeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('matches items starting with typed characters', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ timeout: 400, onMatch })
    const items = ['Apple', 'Banana', 'Blueberry', 'Cherry']

    const eventB = new KeyboardEvent('keydown', { key: 'b' })
    const handledB = typeahead.handleKeydown(eventB, items, 0)
    expect(handledB).toBe(true)
    expect(onMatch).toHaveBeenCalledWith(1) // Banana

    const eventL = new KeyboardEvent('keydown', { key: 'l' })
    const handledL = typeahead.handleKeydown(eventL, items, 1)
    expect(handledL).toBe(true)
    expect(onMatch).toHaveBeenCalledWith(2) // Blueberry ("bl")
  })

  it('handles empty or whitespace item labels gracefully', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ onMatch })
    const items = ['', '   ', 'Apple']

    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a' }), items, 0)).toBe(true)
    expect(onMatch).toHaveBeenCalledWith(2)
  })

  it('returns false when no items match typed query', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ timeout: 300, onMatch })
    const items = ['Apple', 'Banana']

    const handled = typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'z' }), items, 0)
    expect(handled).toBe(false)
    expect(onMatch).not.toHaveBeenCalled()
  })

  it('resets buffer after timeout', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ timeout: 300, onMatch })
    const items = ['Apple', 'Banana', 'Cherry']

    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'b' }), items, 0)
    expect(onMatch).toHaveBeenCalledWith(1)

    vi.advanceTimersByTime(350)

    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'c' }), items, 1)
    expect(onMatch).toHaveBeenCalledWith(2) // Cherry, not "bc"
  })

  it('cycles through items on repeated same character', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ timeout: 500, onMatch })
    const items = ['Blueberry', 'Banana', 'Blackberry']

    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'b' }), items, 0)
    expect(onMatch).toHaveBeenCalledWith(0)

    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'b' }), items, 0)
    expect(onMatch).toHaveBeenCalledWith(1) // cycles to Banana

    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'b' }), items, 1)
    expect(onMatch).toHaveBeenCalledWith(2) // cycles to Blackberry
  })

  it('ignores modifier keys, spaces, and multi-char keys', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ onMatch })
    const items = ['Apple', 'Banana']

    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }), items, 0)).toBe(false)
    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: ' ' }), items, 0)).toBe(false)
    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }), items, 0)).toBe(false)
    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a', altKey: true }), items, 0)).toBe(false)
    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a', metaKey: true }), items, 0)).toBe(false)
    expect(onMatch).not.toHaveBeenCalled()
  })

  it('handles empty items array gracefully', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ onMatch })
    expect(typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a' }), [], 0)).toBe(false)
  })

  it('allows manual buffer reset even when clearTimer is null', () => {
    const onMatch = vi.fn()
    const typeahead = useTypeahead({ onMatch })
    const items = ['Apple', 'Banana', 'Apricot']

    typeahead.resetBuffer() // when null
    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'a' }), items, 0)
    typeahead.resetBuffer() // when active
    typeahead.handleKeydown(new KeyboardEvent('keydown', { key: 'p' }), items, 0)
    expect(onMatch).not.toHaveBeenCalledWith(2)
  })
})
