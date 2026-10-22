<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, useId } from 'vue'
import { Search as SearchIcon, X as XIcon } from 'lucide-vue-next'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import DsVisuallyHidden from '@/components/DsVisuallyHidden/DsVisuallyHidden.vue'

export interface DsSearchBarProps {
  /**
   * Search input element ID.
   */
  id?: string
  /**
   * Placeholder text for search input.
   * @default 'Search...'
   */
  placeholder?: string
  /**
   * Keyboard shortcut key to focus search (e.g., '/' or 'k').
   */
  hotkey?: string
  /**
   * Visual shortcut hint label (e.g., '⌘K' or '/').
   */
  shortcutLabel?: string
  /**
   * Accessible landmark label.
   * @default 'Site search'
   */
  ariaLabel?: string
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<DsSearchBarProps>(), {
  id: undefined,
  placeholder: 'Search...',
  hotkey: undefined,
  shortcutLabel: undefined,
  ariaLabel: 'Site search',
  disabled: false
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'clear'): void
}>()

const model = defineModel<string>({ default: '' })
const autoId = useId()
const computedId = computed<string>(() => props.id || `ds-search-${autoId}`)
const inputRef = ref<HTMLInputElement | null>(null)

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  model.value = target.value
}

function handleClear(): void {
  model.value = ''
  emit('clear')
  inputRef.value?.focus()
}

function handleInputKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && model.value) {
    event.preventDefault()
    handleClear()
  }
}

function handleSubmit(event: Event): void {
  event.preventDefault()
  emit('search', model.value)
}

function handleGlobalKeydown(event: KeyboardEvent): void {
  if (!props.hotkey || props.disabled) return

  // Don't trigger if user is already typing in an input, textarea, or contenteditable
  const activeEl = document.activeElement
  const isInputActive =
    activeEl instanceof HTMLInputElement ||
    activeEl instanceof HTMLTextAreaElement ||
    activeEl?.getAttribute('contenteditable') === 'true'

  if (isInputActive && activeEl !== inputRef.value) return

  if (props.hotkey === '/' && event.key === '/') {
    event.preventDefault()
    inputRef.value?.focus()
  } else if (
    props.hotkey.toLowerCase() === 'k' &&
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === 'k'
  ) {
    event.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  if (props.hotkey && typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
})
</script>

<template src="./DsSearchBar.html"></template>
<style lang="scss" scoped src="./DsSearchBar.scss"></style>
