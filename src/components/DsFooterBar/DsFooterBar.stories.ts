import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DsFooterBar from './DsFooterBar.vue'

const meta: Meta<typeof DsFooterBar> = {
  title: 'Primitives/DsFooterBar',
  component: DsFooterBar,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['surface', 'base']
    },
    bordered: {
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof DsFooterBar>

export const Default: Story = {
  args: {
    variant: 'surface',
    bordered: true
  },
  render: (args) => ({
    components: { DsFooterBar },
    setup() {
      return { args }
    },
    template: `
      <DsFooterBar v-bind="args">
        <template #start>
          <span>Homelab Portal</span>
        </template>
        <template #center>
          <span>All services operational</span>
        </template>
        <template #end>
          <span>v1.1.0</span>
        </template>
      </DsFooterBar>
    `
  })
}
