<script setup lang="ts">
import { computed, provide, ref, useId, watch } from 'vue'
import { useRovingFocus } from '@/composables/a11y/useRovingFocus'

export interface DsTabItem {
  id: string
  label: string
  disabled?: boolean
  badge?: string | number
}

export interface DsTabsProps {
  /**
   * Accessible label for the tablist landmark.
   */
  label?: string
  /**
   * Tab definitions.
   */
  tabs: DsTabItem[]
  /**
   * Layout orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * If true, requires explicit Enter/Space to select tab instead of automatic selection on focus.
   * @default false
   */
  manual?: boolean
}

const props = withDefaults(defineProps<DsTabsProps>(), {
  label: 'Navigation tabs',
  orientation: 'horizontal',
  manual: false
})

const model = defineModel<string>({ default: '' })
const autoId = useId()
const tabRefs = ref<(HTMLButtonElement | null)[]>([])

// Determine initial index
const initialIdx = computed<number>(() => {
  const found = props.tabs.findIndex((t) => t.id === model.value)
  return found >= 0 ? found : 0
})

const roving = useRovingFocus({
  orientation: props.orientation,
  loop: true,
  initialIndex: initialIdx.value,
  onFocusChange: (newIndex) => {
    if (!props.manual) {
      const targetTab = props.tabs[newIndex]
      if (targetTab && !targetTab.disabled) {
        model.value = targetTab.id
      }
    }
  }
})

// Keep model initialized if empty
if (!model.value && props.tabs.length > 0) {
  model.value = props.tabs[0]?.id ?? ''
}

watch(
  () => model.value,
  (newVal) => {
    const idx = props.tabs.findIndex((t) => t.id === newVal)
    if (idx >= 0 && roving.currentIndex.value !== idx) {
      roving.currentIndex.value = idx
    }
  }
)

function getTabDomId(tabId: string): string {
  return `ds-tab-${autoId}-${tabId}`
}

function getPanelDomId(tabId: string): string {
  return `ds-panel-${autoId}-${tabId}`
}

function selectTab(tab: DsTabItem, index: number): void {
  if (tab.disabled) return
  model.value = tab.id
  roving.currentIndex.value = index
}

function onKeydown(event: KeyboardEvent): void {
  roving.handleKeydown(event, tabRefs.value)

  if (props.manual && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    const activeTab = props.tabs[roving.currentIndex.value]
    if (activeTab && !activeTab.disabled) {
      model.value = activeTab.id
    }
  }
}

provide('dsTabsActiveId', model)
</script>

<template src="./DsTabs.html"></template>
<style lang="scss" scoped src="./DsTabs.scss"></style>
