<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useRovingFocus } from '@/composables/a11y/useRovingFocus'
import { useTypeahead } from '@/composables/a11y/useTypeahead'
import { useFocusReturn } from '@/composables/a11y/useFocusReturn'
import { useAnchorFallback } from '@/composables/a11y/useAnchorFallback'

export interface DsMenuItem {
  id: string
  label: string
  disabled?: boolean
  destructive?: boolean
}

export interface DsMenuProps {
  /**
   * Accessible trigger label if not using trigger slot.
   * @default 'Menu'
   */
  label?: string
  /**
   * Menu items list.
   */
  items: DsMenuItem[]
  /**
   * Placement relative to trigger.
   * @default 'bottom-start'
   */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /**
   * Disabled state of the menu trigger.
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<DsMenuProps>(), {
  label: 'Menu',
  placement: 'bottom-start',
  disabled: false
})

const emit = defineEmits<{
  (e: 'select', item: DsMenuItem): void
}>()

const isOpen = ref<boolean>(false)
const autoId = useId()
const menuId = computed<string>(() => `ds-menu-${autoId}`)
const triggerId = computed<string>(() => `ds-menu-trigger-${autoId}`)

const triggerRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLDivElement | null>(null)
const itemRefs = ref<(HTMLButtonElement | null)[]>([])

const focusReturn = useFocusReturn()
const fallback = useAnchorFallback()

const roving = useRovingFocus({
  orientation: 'vertical',
  loop: true
})

const typeahead = useTypeahead({
  onMatch: (matchedIndex) => {
    roving.focusItem(matchedIndex, itemRefs.value)
  }
})

function openMenu(): void {
  if (props.disabled || isOpen.value) return
  focusReturn.saveFocus(triggerRef.value)
  isOpen.value = true

  nextTick(() => {
    if (popoverRef.value && typeof popoverRef.value.showPopover === 'function') {
      try {
        popoverRef.value.showPopover()
      } catch {
        // Popover already open
      }
    }

    if (!fallback.isSupported && triggerRef.value && popoverRef.value) {
      fallback.updatePosition(triggerRef.value, popoverRef.value, props.placement)
    }

    // Focus first enabled item
    const firstEnabled = props.items.findIndex((item) => !item.disabled)
    if (firstEnabled >= 0) {
      roving.focusItem(firstEnabled, itemRefs.value)
    }
  })
}

function closeMenu(): void {
  if (!isOpen.value) return
  isOpen.value = false

  if (popoverRef.value && typeof popoverRef.value.hidePopover === 'function') {
    try {
      popoverRef.value.hidePopover()
    } catch {
      // Already hidden
    }
  }

  fallback.cleanup()
  focusReturn.restoreFocus()
}

function toggleMenu(): void {
  if (isOpen.value) {
    closeMenu()
  } else {
    openMenu()
  }
}

function handleSelect(item: DsMenuItem): void {
  if (item.disabled) return
  emit('select', item)
  closeMenu()
}

function handleMenuKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu()
    return
  }

  if (event.key === 'Tab') {
    closeMenu()
    return
  }

  // Handle typeahead
  const labels = props.items.map((i) => i.label)
  const handledTypeahead = typeahead.handleKeydown(
    event,
    labels,
    roving.currentIndex.value
  )
  if (handledTypeahead) {
    event.preventDefault()
    return
  }

  // Handle arrows and home/end
  roving.handleKeydown(event, itemRefs.value)
}

function handleTriggerKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openMenu()
  }
}

function handleToggleEvent(event: Event): void {
  // Listen for native Popover API light dismiss toggle
  const toggleEvent = event as ToggleEvent
  if ((toggleEvent.newState === 'closed' || !toggleEvent.newState) && isOpen.value) {
    isOpen.value = false
    fallback.cleanup()
    focusReturn.restoreFocus()
  }
}

watch(
  () => props.disabled,
  (isDisabled) => {
    if (isDisabled && isOpen.value) {
      closeMenu()
    }
  }
)
</script>

<template src="./DsMenu.html"></template>
<style lang="scss" scoped src="./DsMenu.scss"></style>
