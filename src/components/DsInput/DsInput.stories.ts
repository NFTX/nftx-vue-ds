import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import DsInput from './DsInput.vue'
import DsField from '@/components/DsField/DsField.vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { Search, Mail } from 'lucide-vue-next'

const meta = {
  title: 'Atoms/DsInput',
  component: DsInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    clearable: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof DsInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter your name...',
    clearable: true
  },
  render: (args) => ({
    components: { DsInput, DsField },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: `
      <DsField label="Full Name">
        <DsInput v-model="val" v-bind="args" />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'Ada Lovelace')
    expect(input).toHaveValue('Ada Lovelace')

    const clearBtn = canvas.getByLabelText('Clear input')
    expect(clearBtn).not.toBeNull()
    await userEvent.click(clearBtn)
    expect(input).toHaveValue('')
  }
}

export const WithPrefixAndSuffix: Story = {
  render: () => ({
    components: { DsInput, DsField, DsIcon },
    setup() {
      const query = ref('')
      return { query, Search, Mail }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-inline-size: 24rem;">
        <DsField label="Search documentation">
          <DsInput v-model="query" type="search" placeholder="Type keywords...">
            <template #prefix>
              <DsIcon :icon="Search" size="sm" />
            </template>
          </DsInput>
        </DsField>

        <DsField label="Email Address">
          <DsInput v-model="query" type="email" placeholder="you@domain.com">
            <template #prefix>
              <DsIcon :icon="Mail" size="sm" />
            </template>
          </DsInput>
        </DsField>
      </div>
    `
  })
}

export const InsideFieldWithError: Story = {
  render: () => ({
    components: { DsInput, DsField },
    setup() {
      const email = ref('invalid-email')
      return { email }
    },
    template: `
      <DsField label="Work Email" error="Please enter a valid business email address.">
        <DsInput v-model="email" type="email" />
      </DsField>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  }
}
