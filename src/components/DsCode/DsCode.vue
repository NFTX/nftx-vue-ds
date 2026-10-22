<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Check, Copy } from 'lucide-vue-next'
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

const { announce } = useAnnouncer()
const codeRef = ref<HTMLElement | null>(null)
const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const wrapperClasses = computed<Record<string, boolean>>(() => ({
  'ds-code': true,
  'ds-code--block': props.block,
  'ds-code--inline': !props.block,
  'ds-code--copyable': props.copyable,
  [`ds-code--${props.size}`]: true
}))

const copyAriaLabel = computed<string>(() =>
  copied.value ? 'Copied to clipboard' : 'Copy code to clipboard'
)

async function handleCopy(): Promise<void> {
  const textToCopy = (props.copyText ?? codeRef.value?.textContent ?? '').trim()
  if (!textToCopy) return

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(textToCopy)
  }

  copied.value = true
  announce('Copied to clipboard', 'polite')

  if (copyTimeout !== null) {
    clearTimeout(copyTimeout)
  }
  copyTimeout = setTimeout(() => {
    copied.value = false
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
