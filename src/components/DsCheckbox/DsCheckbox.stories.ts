import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import DsCheckbox from './DsCheckbox.vue'

const meta = {
  title: 'Atoms/DsCheckbox',
  component: DsCheckbox,
  tags: ['autodocs'],
  argTypes: {
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' }
  }
} satisfies Meta<typeof DsCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Subscribe to product newsletter'
  },
  render: (args) => ({
    components: { DsCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: '<DsCheckbox v-model="checked" v-bind="args" />'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('checkbox', { name: /subscribe to product newsletter/i })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  }
}

export const Indeterminate: Story = {
  args: {
    label: 'Select all features (3 of 7 selected)',
    indeterminate: true
  },
  render: (args) => ({
    components: { DsCheckbox },
    setup() {
      const checked = ref(false)
      return { args, checked }
    },
    template: '<DsCheckbox v-model="checked" v-bind="args" />'
  })
}

export const GroupArrayBinding: Story = {
  render: () => ({
    components: { DsCheckbox },
    setup() {
      const selected = ref<string[]>(['vue', 'vite'])
      return { selected }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <DsCheckbox v-model="selected" value="vue" label="Vue 3" />
        <DsCheckbox v-model="selected" value="vite" label="Vite" />
        <DsCheckbox v-model="selected" value="vitest" label="Vitest" />
        <p>Selected: {{ selected.join(', ') }}</p>
      </div>
    `
  })
}

export const Disabled: Story = {
  args: {
    label: 'Restricted administrative permission',
    disabled: true
  },
  render: (args) => ({
    components: { DsCheckbox },
    setup() {
      const checked = ref(true)
      return { args, checked }
    },
    template: '<DsCheckbox v-model="checked" v-bind="args" />'
  })
}
