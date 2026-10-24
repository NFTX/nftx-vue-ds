import type { Meta, StoryObj } from '@storybook/vue3'
import DsTable from './DsTable.vue'

const meta: Meta<typeof DsTable> = {
  title: 'Components/DsTable',
  component: DsTable,
  tags: ['autodocs'],
  argTypes: {
    striped: { control: 'boolean' },
    hoverable: { control: 'boolean' },
    compact: { control: 'boolean' },
    bordered: { control: 'boolean' },
    responsive: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof DsTable>

export const Default: Story = {
  args: {
    caption: 'Pautas do Jornal',
    striped: false,
    hoverable: true,
    compact: false,
    bordered: false
  },
  render: (args) => ({
    components: { DsTable },
    setup() {
      return { args }
    },
    template: `
      <DsTable v-bind="args">
        <template #header>
          <tr>
            <th style="width: 60px">#</th>
            <th>Título da Pauta</th>
            <th>Seção</th>
            <th>Status</th>
          </tr>
        </template>
        <tr>
          <td>1</td>
          <td>Editorial Principal</td>
          <td>Opinião</td>
          <td>Vinculado</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Panorama Político Nacional</td>
          <td>Nacional</td>
          <td>Pendente</td>
        </tr>
      </DsTable>
    `
  })
}
