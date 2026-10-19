<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import DsVisuallyHidden from '@/components/DsVisuallyHidden/DsVisuallyHidden.vue'

export type DsLinkVariant = 'primary' | 'subtle'

export interface DsLinkProps {
  /**
   * The destination URL.
   */
  href: string
  /**
   * Target browsing context.
   * @default '_self'
   */
  target?: string
  /**
   * Relationship of the linked URL.
   */
  rel?: string
  /**
   * Visual variant.
   * @default 'primary'
   */
  variant?: DsLinkVariant
  /**
   * Force external indicator icon and accessible message.
   */
  external?: boolean
}

const props = withDefaults(defineProps<DsLinkProps>(), {
  target: '_self',
  rel: undefined,
  variant: 'primary',
  external: undefined
})

const isExternal = computed<boolean>(() => {
  if (props.external !== undefined) {
    return props.external
  }
  return props.target === '_blank' || /^https?:\/\//i.test(props.href)
})

const computedRel = computed<string | undefined>(() => {
  if (props.rel) {
    return props.rel
  }
  if (props.target === '_blank') {
    return 'noopener noreferrer'
  }
  return undefined
})

const variantClass = computed<string>(() => `ds-link--${props.variant}`)
</script>

<template src="./DsLink.html"></template>
<style lang="scss" scoped src="./DsLink.scss"></style>
