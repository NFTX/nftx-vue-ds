import { onBeforeUnmount } from 'vue'

let activeLocks = 0
let originalOverflow = ''

export interface UseScrollLockReturn {
  lock: () => void
  unlock: () => void
}

export function useScrollLock(): UseScrollLockReturn {
  let isLockedByThisInstance = false

  function lock(): void {
    if (typeof document !== 'undefined' && document.body && !isLockedByThisInstance) {
      if (activeLocks === 0) {
        originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
      activeLocks++
      isLockedByThisInstance = true
    }
  }

  function unlock(): void {
    if (typeof document !== 'undefined' && document.body && isLockedByThisInstance) {
      activeLocks = Math.max(0, activeLocks - 1)
      if (activeLocks === 0) {
        document.body.style.overflow = originalOverflow || ''
      }
      isLockedByThisInstance = false
    }
  }

  onBeforeUnmount(() => {
    unlock()
  })

  return {
    lock,
    unlock
  }
}
