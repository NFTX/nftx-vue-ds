// src/composables/a11y/useAnnouncer.ts
import { ref, type Ref } from 'vue'

export type AnnouncerPriority = 'polite' | 'assertive'
export type AnnouncerPoliteness = AnnouncerPriority

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

function syncLiveRegion(priority: AnnouncerPriority, text: string): void {
  const id = `ds-announcer-${priority}`
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    el.setAttribute('aria-live', priority)
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
    Object.assign(el.style, {
      position: 'fixed',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    })
    document.body.appendChild(el)
  }
  el.textContent = text
}

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
      syncLiveRegion('assertive', '')
      assertiveTimer = setTimeout(() => {
        assertiveMessage.value = clean
        syncLiveRegion('assertive', clean)
        assertiveTimer = null
      }, 50)
    } else {
      if (politeTimer) {
        clearTimeout(politeTimer)
        politeTimer = null
      }
      politeMessage.value = ''
      syncLiveRegion('polite', '')
      politeTimer = setTimeout(() => {
        politeMessage.value = clean
        syncLiveRegion('polite', clean)
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
    syncLiveRegion('polite', '')
    syncLiveRegion('assertive', '')
  }

  return {
    politeMessage,
    assertiveMessage,
    announce,
    clear
  }
}
