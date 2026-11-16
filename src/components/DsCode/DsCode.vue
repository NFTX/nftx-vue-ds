<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { AlertCircle, Check, Copy } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { useAnnouncer } from '@/composables/a11y/useAnnouncer'

export type DsCodeSize = 'xs' | 'sm' | 'md'

export interface DsCodeProps {
  /**
   * Whether to render a multi-line `<pre><code>` block instead of inline `<code>`.
   * @default false
   */
  block?: boolean
  /**
   * Whether to display a click-to-copy button.
   * @default false
   */
  copyable?: boolean
  /**
   * Optional explicit text to copy to the clipboard. Defaults to the rendered code text content.
   */
  copyText?: string
  /**
   * Font size scale.
   * @default 'xs'
   */
  size?: DsCodeSize
}

const props = withDefaults(defineProps<DsCodeProps>(), {
  block: false,
  copyable: false,
  copyText: undefined,
  size: 'xs'
})

type CopyState = 'idle' | 'copied' | 'failed'

const { announce } = useAnnouncer()
const codeRef = ref<HTMLElement | null>(null)
const copyState = ref<CopyState>('idle')
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const wrapperClasses = computed<Record<string, boolean>>(() => ({
  'ds-code': true,
  'ds-code--block': props.block,
  'ds-code--inline': !props.block,
  'ds-code--copyable': props.copyable,
  [`ds-code--${props.size}`]: true
}))

const COPY_LABELS: Record<CopyState, string> = {
  idle: 'Copy code to clipboard',
  copied: 'Copied to clipboard',
  failed: 'Copy failed'
}

const copyAriaLabel = computed<string>(() => COPY_LABELS[copyState.value])
const copyIcon = computed(() => {
  if (copyState.value === 'copied') return Check
  if (copyState.value === 'failed') return AlertCircle
  return Copy
})

// navigator.clipboard only exists in secure contexts (https or localhost)
async function writeToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

async function handleCopy(): Promise<void> {
  const textToCopy = (props.copyText ?? codeRef.value?.textContent ?? '').trim()
  if (!textToCopy) return

  copyState.value = (await writeToClipboard(textToCopy)) ? 'copied' : 'failed'
  announce(COPY_LABELS[copyState.value], 'polite')

  if (copyTimeout !== null) {
    clearTimeout(copyTimeout)
  }
  copyTimeout = setTimeout(() => {
    copyState.value = 'idle'
    copyTimeout = null
  }, 2000)
}

onBeforeUnmount(() => {
  if (copyTimeout !== null) {
    clearTimeout(copyTimeout)
  }
})
</script>

<template src="./DsCode.html"></template>
<style lang="scss" scoped src="./DsCode.scss"></style>
