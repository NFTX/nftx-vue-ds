// src/composables/a11y/useAnnouncer.ts
import { ref, type Ref } from 'vue'

export type AnnouncerPriority = 'polite' | 'assertive'

export interface UseAnnouncerReturn {
  politeMessage: Ref<string>
  assertiveMessage: Ref<string>
  announce: (message: string, priority?: AnnouncerPriority) => void
  clear: () => void
}

const politeMessage = ref<string>('')
const assertiveMessage = ref<string>('')
let politeTimer: ReturnType<typeof setTimeout> | null = null
let assertiveTimer: ReturnType<typeof setTimeout> | null = null

export function useAnnouncer(): UseAnnouncerReturn {
  function announce(message: string, priority: AnnouncerPriority = 'polite'): void {
    const clean = message.trim()
    if (!clean) return

    if (priority === 'assertive') {
      if (assertiveTimer) {
        clearTimeout(assertiveTimer)
        assertiveTimer = null
      }
      assertiveMessage.value = ''
      assertiveTimer = setTimeout(() => {
        assertiveMessage.value = clean
        assertiveTimer = null
      }, 50)
    } else {
      if (politeTimer) {
        clearTimeout(politeTimer)
        politeTimer = null
      }
      politeMessage.value = ''
      politeTimer = setTimeout(() => {
        politeMessage.value = clean
        politeTimer = null
      }, 50)
    }
  }

  function clear(): void {
    if (politeTimer) {
      clearTimeout(politeTimer)
      politeTimer = null
    }
    if (assertiveTimer) {
      clearTimeout(assertiveTimer)
      assertiveTimer = null
    }
    politeMessage.value = ''
    assertiveMessage.value = ''
  }

  return {
    politeMessage,
    assertiveMessage,
    announce,
    clear
  }
}
