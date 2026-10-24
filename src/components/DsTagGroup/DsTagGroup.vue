<script setup lang="ts">
import { ref, computed } from 'vue'
import DsTag, { type DsTagVariant, type DsTagSize, type DsTagShape } from '@/components/DsTag/DsTag.vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'

export interface DsTagGroupProps {
  /**
   * List of tags if not using v-model.
   */
  tags?: string[]
  /**
   * Whether users can add or remove tags interactively.
   * @default false
   */
  editable?: boolean
  /**
   * Placeholder when tag input is empty.
   * @default '+ Adicionar...'
   */
  placeholder?: string
  /**
   * Variant for the rendered tags.
   * @default 'subtle'
   */
  variant?: DsTagVariant
  /**
   * Size for the rendered tags and input.
   * @default 'sm'
   */
  size?: DsTagSize
  /**
   * Shape of the tags.
   * @default 'rounded'
   */
  shape?: DsTagShape
  /**
   * Whether to allow duplicate tag names.
   * @default false
   */
  allowDuplicates?: boolean
}

const props = withDefaults(defineProps<DsTagGroupProps>(), {
  tags: undefined,
  editable: false,
  placeholder: '+ Adicionar...',
  variant: 'subtle',
  size: 'sm',
  shape: 'rounded',
  allowDuplicates: false
})

const model = defineModel<string[]>({ default: () => [] })

const emit = defineEmits<{
  (e: 'add', tag: string): void
  (e: 'remove', index: number, tag: string): void
}>()

const newTagInput = ref('')
const isAdding = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const currentTags = computed<string[]>({
  get() {
    return props.tags !== undefined ? props.tags : model.value
  },
  set(val: string[]) {
    model.value = val
  }
})

function removeTag(index: number) {
  const removed = currentTags.value[index]
  if (removed === undefined) return
  const updated = [...currentTags.value]
  updated.splice(index, 1)
  currentTags.value = updated
  emit('remove', index, removed)
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    commitNewTag()
  } else if (event.key === 'Backspace' && newTagInput.value === '' && currentTags.value.length > 0) {
    removeTag(currentTags.value.length - 1)
  } else if (event.key === 'Escape') {
    newTagInput.value = ''
    isAdding.value = false
  }
}

function commitNewTag() {
  const trimmed = newTagInput.value.trim().replace(/^,+|,+$/g, '')
  if (!trimmed) {
    isAdding.value = false
    return
  }

  if (!props.allowDuplicates && currentTags.value.includes(trimmed)) {
    newTagInput.value = ''
    return
  }

  const updated = [...currentTags.value, trimmed]
  currentTags.value = updated
  emit('add', trimmed)
  newTagInput.value = ''
}

function startAdding() {
  isAdding.value = true
  setTimeout(() => {
    inputRef.value?.focus()
  }, 10)
}

function handleInputBlur() {
  commitNewTag()
  isAdding.value = false
}
</script>

<template src="./DsTagGroup.html"></template>
<style lang="scss" scoped src="./DsTagGroup.scss"></style>
