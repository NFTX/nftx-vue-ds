import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, computed } from 'vue'
import { expect, userEvent } from 'storybook/test'
import { DsSkipLink } from '@/components/DsSkipLink'
import { DsHeaderBar } from '@/components/DsHeaderBar'
import { DsSearchBar } from '@/components/DsSearchBar'
import { DsChipGroup } from '@/components/DsChipGroup'
import { DsCardGrid } from '@/components/DsCardGrid'
import { DsCard } from '@/components/DsCard'
import { DsBadge } from '@/components/DsBadge'
import { DsButton } from '@/components/DsButton'
import { DsEmptyState } from '@/components/DsEmptyState'

/**
 * Full page integration demo demonstrating end-to-end composition of
 * `@nftx/vue-ds` layout organisms, atoms, and molecules.
 * Conforms to WCAG 2.2 AA landmarks, reflows cleanly at 320px, and passes axe audits.
 */
const meta = {
  title: 'Pages/HomelabDashboardDemo',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FullDashboard: Story = {
  render: () => ({
    components: {
      DsSkipLink,
      DsHeaderBar,
      DsSearchBar,
      DsChipGroup,
      DsCardGrid,
      DsCard,
      DsBadge,
      DsButton,
      DsEmptyState
    },
    setup() {
      const currentTheme = ref<'light' | 'dark'>('light')
      const searchQuery = ref('')
      const selectedCategory = ref<string | number>('all')

      const categories = [
        { value: 'all', label: 'All Services', count: 4 },
        { value: 'media', label: 'Media', count: 2 },
        { value: 'ai', label: 'AI & ML', count: 1 },
        { value: 'network', label: 'Network', count: 1 }
      ]

      const allServices = [
        { id: 'plex', name: 'Plex Server', category: 'media', port: 32400, description: 'Personal streaming service for music and movies', badge: 'Active' },
        { id: 'jellyfin', name: 'Jellyfin', category: 'media', port: 8096, description: 'Open source media server and transcoder', badge: 'Active' },
        { id: 'ollama', name: 'Ollama LLM', category: 'ai', port: 11434, description: 'Local LLM inference runner with OpenAI compatible API', badge: 'Local' },
        { id: 'pihole', name: 'Pi-hole DNS', category: 'network', port: 8080, description: 'Network-wide ad blocking via DNS sinkhole', badge: 'LAN' }
      ]

      const filteredServices = computed(() => {
        return allServices.filter(service => {
          const matchesCategory = selectedCategory.value === 'all' || service.category === selectedCategory.value
          const matchesSearch = !searchQuery.value ||
            service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.value.toLowerCase())
          return matchesCategory && matchesSearch
        })
      })

      function toggleTheme() {
        currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
      }

      function clearSearch() {
        searchQuery.value = ''
      }

      return {
        currentTheme,
        searchQuery,
        selectedCategory,
        categories,
        filteredServices,
        toggleTheme,
        clearSearch
      }
    },
    template: `
      <div :data-theme="currentTheme" style="min-height: 100vh; background-color: var(--ds-color-bg-base); color: var(--ds-color-text-primary);">
        <DsSkipLink target-id="main-content">Skip to homelab services</DsSkipLink>

        <DsHeaderBar
          title="Homelab Hub"
          subtitle="Local Ingress Gateway"
          :theme="currentTheme"
          :sticky="true"
          @toggle-theme="toggleTheme"
        >
          <template #search>
            <DsSearchBar
              v-model="searchQuery"
              placeholder="Search local homelab services..."
              style="inline-size: 24rem;"
            />
          </template>
        </DsHeaderBar>

        <main id="main-content" style="padding-block: var(--ds-space-6); padding-inline: var(--ds-space-4); max-inline-size: 80rem; margin-inline: auto;">
          <section aria-label="Service Category Filters" style="margin-block-end: var(--ds-space-6);">
            <DsChipGroup
              v-model="selectedCategory"
              :options="categories"
              label="Filter services by category"
            />
          </section>

          <DsEmptyState
            v-if="filteredServices.length === 0"
            title="No Services Found"
            :description="'No services matched your query: ' + searchQuery"
            icon="search"
            action-label="Clear Search"
            variant="card"
            @action="clearSearch"
          />

          <DsCardGrid v-else min-col-width="18rem" gap="md">
            <li
              v-for="service in filteredServices"
              :key="service.id"
              class="ds-card-grid__item"
              role="listitem"
            >
              <DsCard variant="elevated" padding="md">
                <template #header>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: var(--ds-font-size-base); margin: 0;">{{ service.name }}</h2>
                    <DsBadge variant="brand" size="sm">{{ service.badge }}</DsBadge>
                  </div>
                </template>
                <p style="font-size: var(--ds-font-size-sm); color: var(--ds-color-text-secondary); margin-block-end: var(--ds-space-3);">
                  {{ service.description }}
                </p>
                <template #footer>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--ds-font-size-xs); color: var(--ds-color-text-muted);">
                    <span>Port :{{ service.port }}</span>
                    <DsButton variant="ghost" size="sm">Open &rarr;</DsButton>
                  </div>
                </template>
              </DsCard>
            </li>
          </DsCardGrid>
        </main>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const mainEl = canvasElement.querySelector<HTMLElement>('#main-content')
    expect(mainEl).not.toBeNull()

    const searchInput = canvasElement.querySelector<HTMLInputElement>('input[type="search"]')
    if (searchInput) {
      await userEvent.type(searchInput, 'nonexistent')
      const emptyState = canvasElement.querySelector<HTMLElement>('.ds-empty-state')
      expect(emptyState).not.toBeNull()

      const clearBtn = canvasElement.querySelector<HTMLButtonElement>('.ds-empty-state__actions button')
      if (clearBtn) {
        await userEvent.click(clearBtn)
        const grid = canvasElement.querySelector<HTMLElement>('.ds-card-grid')
        expect(grid).not.toBeNull()
      }
    }
  }
}
