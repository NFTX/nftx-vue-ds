// src/components/DsToast/toastStack.ts
// Open toasts at the same position stack instead of overlapping
import { reactive } from 'vue'

interface StackEntry {
  id: string
  height: number
}

const GAP_PX = 8
let nextId = 0

/** Stack ids must be unique across Vue apps on the page, which useId() does not guarantee. */
export function createToastStackId(): string {
  nextId += 1
  return `ds-toast-${nextId}`
}
const stacks = reactive<Record<string, StackEntry[]>>({})

export function joinToastStack(position: string, id: string, height: number): void {
  stacks[position] = [...(stacks[position] ?? []).filter((entry) => entry.id !== id), { id, height }]
}

export function leaveToastStack(position: string, id: string): void {
  const list = stacks[position]
  if (list) stacks[position] = list.filter((entry) => entry.id !== id)
}

/** Distance in px from the screen edge: the heights of the toasts opened earlier at this position. */
export function toastStackOffset(position: string, id: string): number {
  let offset = 0
  for (const entry of stacks[position] ?? []) {
    if (entry.id === id) return offset
    offset += entry.height + GAP_PX
  }
  return 0
}
