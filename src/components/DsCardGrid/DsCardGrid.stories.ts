import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import DsCardGrid from './DsCardGrid.vue'
import { DsCard } from '@/components/DsCard'

/**
 * `DsCardGrid` provides an intrinsically responsive auto-fit CSS grid layout with
 * gap design tokens and semantic list structure (`role="list"` / `role="listitem"`).
 * It automatically adapts columns down to 320px viewports without horizontal overflow.
 */
const meta = {
  title: 'Organisms/DsCardGrid',
  component: DsCardGrid,
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'text',
      description: 'Root container tag (default ul)'
    },
    minColWidth: {
      control: 'text',
      description: 'Minimum column width before wrapping'
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap spacing token'
    },
    dense: {
      control: 'boolean',
      description: 'Grid auto-flow dense packing'
    }
  }
} satisfies Meta<typeof DsCardGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    minColWidth: '16rem',
    gap: 'md',
    dense: false
  },
  render: (args) => ({
    components: { DsCardGrid, DsCard },
    setup() {
      return { args }
    },
    template: `
      <DsCardGrid v-bind="args">
        <li v-for="i in 6" :key="i" class="ds-card-grid__item" role="listitem">
          <DsCard variant="elevated" padding="md">
            <h3>Card {{ i }}</h3>
            <p>Responsive grid card content adapting automatically.</p>
          </DsCard>
        </li>
      </DsCardGrid>
    `
  }),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector<HTMLElement>('.ds-card-grid')
    expect(grid).not.toBeNull()
    expect(grid?.getAttribute('role')).toBe('list')
  }
}

export const DensePacking: Story = {
  args: {
    minColWidth: '14rem',
    gap: 'sm',
    dense: true
  },
  render: (args) => ({
    components: { DsCardGrid, DsCard },
    setup() {
      return { args }
    },
    template: `
      <DsCardGrid v-bind="args">
        <li v-for="i in 8" :key="i" class="ds-card-grid__item" role="listitem">
          <DsCard variant="outlined" padding="sm">
            <h4>Item {{ i }}</h4>
            <p>Compact dense item.</p>
          </DsCard>
        </li>
      </DsCardGrid>
    `
  })
}

export const WithItemsProp: Story = {
  args: {
    minColWidth: '18rem',
    gap: 'lg',
    items: [
      { id: '1', title: 'Plex Media Server', port: 32400 },
      { id: '2', title: 'Home Assistant', port: 8123 },
      { id: '3', title: 'Pi-hole DNS', port: 8080 }
    ]
  },
  render: (args) => ({
    components: { DsCardGrid, DsCard },
    setup() {
      return { args }
    },
    template: `
      <DsCardGrid v-bind="args">
        <template #item="{ item }">
          <DsCard variant="elevated" padding="md">
            <h3>{{ item.title }}</h3>
            <p>Port: {{ item.port }}</p>
          </DsCard>
        </template>
      </DsCardGrid>
    `
  })
}

export const Reflow320px: Story = {
  args: {
    minColWidth: '18rem',
    gap: 'md'
  },
  render: (args) => ({
    components: { DsCardGrid, DsCard },
    setup() {
      return { args }
    },
    template: `
      <div style="max-inline-size: 320px; border: 1px dashed var(--ds-color-border-interactive); padding: 0.5rem;">
        <DsCardGrid v-bind="args">
          <li class="ds-card-grid__item" role="listitem">
            <DsCard variant="outlined" padding="sm">
              <h4>Narrow Viewport Item 1</h4>
              <p>Ensures 0 horizontal overflow at 320px width.</p>
            </DsCard>
          </li>
          <li class="ds-card-grid__item" role="listitem">
            <DsCard variant="outlined" padding="sm">
              <h4>Narrow Viewport Item 2</h4>
              <p>Gracefully wraps into single-column stack.</p>
            </DsCard>
          </li>
        </DsCardGrid>
      </div>
    `
  })
}
