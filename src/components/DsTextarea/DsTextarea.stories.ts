import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import DsTextarea from './DsTextarea.vue'
import DsField from '@/components/DsField/DsField.vue'

const meta = {
  title: 'Atoms/DsTextarea',
  component: DsTextarea,
  tags: ['autodocs'],
  argTypes: {
    rows: { control: 'number' },
    maxlength: { control: 'number' },
    showCount: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both']
    }
  }
} satisfies Meta<typeof DsTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Write your feedback...',
    rows: 4
  },
  render: (args) => ({
    components: { DsTextarea, DsField },
    setup() {
      const notes = ref('')
      return { args, notes }
    },
    template: `
      <DsField label="Feedback notes">
        <DsTextarea v-model="notes" v-bind="args" />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByRole('textbox')
    await userEvent.type(textarea, 'Antigravity design system is fast.')
    expect(textarea).toHaveValue('Antigravity design system is fast.')
  }
}

export const CharacterCountLimit: Story = {
  args: {
    maxlength: 120,
    showCount: true,
    placeholder: 'Summarize your proposal (max 120 characters)...'
  },
  render: (args) => ({
    components: { DsTextarea, DsField },
    setup() {
      const summary = ref('Initial draft proposal')
      return { args, summary }
    },
    template: `
      <DsField label="Executive Summary">
        <DsTextarea v-model="summary" v-bind="args" />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const count = canvas.getByText(/22 \/ 120/)
    expect(count).not.toBeNull()
  }
}
