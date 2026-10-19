import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import { ref } from 'vue'
import DsSelect from './DsSelect.vue'
import DsField from '@/components/DsField/DsField.vue'

const meta = {
  title: 'Molecules/DsSelect',
  component: DsSelect,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: { control: 'boolean' }
  }
} satisfies Meta<typeof DsSelect>

export default meta
type Story = StoryObj<typeof meta>

const sampleOptions = [
  { label: 'Europe (Frankfurt)', value: 'eu-central-1' },
  { label: 'US East (N. Virginia)', value: 'us-east-1' },
  { label: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
  { label: 'South America (São Paulo) [Unavailable]', value: 'sa-east-1', disabled: true }
]

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Choose a deployment region...'
  },
  render: (args) => ({
    components: { DsSelect, DsField },
    setup() {
      const selected = ref('')
      return { args, selected }
    },
    template: `
      <DsField label="Deployment Region">
        <DsSelect v-model="selected" v-bind="args" />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select') as HTMLSelectElement
    expect(select).not.toBeNull()
    expect(select.options.length).toBe(5) // 1 placeholder + 4 options

    await userEvent.selectOptions(select, 'us-east-1')
    expect(select.value).toBe('us-east-1')
  }
}

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Region selection locked',
    disabled: true
  },
  render: (args) => ({
    components: { DsSelect, DsField },
    setup() {
      const selected = ref('')
      return { args, selected }
    },
    template: `
      <DsField label="Locked Region">
        <DsSelect v-model="selected" v-bind="args" />
      </DsField>
    `
  })
}
