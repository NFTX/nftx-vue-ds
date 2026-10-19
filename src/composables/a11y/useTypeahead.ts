// src/composables/a11y/useTypeahead.ts
export interface UseTypeaheadOptions {
  /**
   * Reset timeout in milliseconds.
   * @default 500
   */
  timeout?: number
  /**
   * Match callback invoked when a match is found.
   */
  onMatch: (index: number) => void
}

export interface UseTypeaheadReturn {
  handleKeydown: (
    event: KeyboardEvent,
    items: string[],
    currentIndex: number
  ) => boolean
  resetBuffer: () => void
}

export function useTypeahead(options: UseTypeaheadOptions): UseTypeaheadReturn {
  const { timeout = 500, onMatch } = options

  let searchString = ''
  let clearTimer: ReturnType<typeof setTimeout> | null = null

  function resetBuffer(): void {
    searchString = ''
    if (clearTimer) {
      clearTimeout(clearTimer)
      clearTimer = null
    }
  }

  function handleKeydown(
    event: KeyboardEvent,
    items: string[],
    currentIndex: number
  ): boolean {
    // Only handle single printable character keys without modifier keys
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.key === ' '
    ) {
      return false
    }

    if (clearTimer) {
      clearTimeout(clearTimer)
    }

    clearTimer = setTimeout(() => {
      resetBuffer()
    }, timeout)

    searchString += event.key.toLowerCase()

    if (items.length === 0) return false

    // If typing repeating identical characters (e.g., "aaa"), cycle through matches starting with that letter
    const isRepeatedChar =
      searchString.length > 1 &&
      searchString.split('').every((char) => char === searchString[0])

    const query = isRepeatedChar ? searchString[0]! : searchString

    const total = items.length
    const startIndex = isRepeatedChar ? (currentIndex + 1) % total : currentIndex

    // Search items starting from the search offset
    for (let i = 0; i < total; i++) {
      const idx = (startIndex + i) % total
      const label = items[idx]?.trim().toLowerCase() ?? ''

      if (label.startsWith(query)) {
        onMatch(idx)
        return true
      }
    }

    return false
  }

  return {
    handleKeydown,
    resetBuffer
  }
}
