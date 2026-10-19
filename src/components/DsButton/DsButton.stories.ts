import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import DsButton from './DsButton.vue'
import DsIcon from '@/components/DsIcon/DsIcon.vue'
import { ArrowRight, Trash2 } from 'lucide-vue-next'

/**
 * `DsButton` renders a native interactive `<button>` element adhering to WAI-ARIA APG Button pattern.
 *
 * ### Keyboard Interaction
 * | Key | Function |
 * | :--- | :--- |
 * | `Enter` | Activates the button |
 * | `Space` | Activates the button |
 */
const meta = {
  title: 'Atoms/DsButton',
  component: DsButton,
  tags: ['autodocs'],
  args: {
    onClick: fn()
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    },
    fullWidth: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof DsButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Primary Action</DsButton>'
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /primary action/i })
    expect(button).not.toBeNull()
    await userEvent.click(button)
    expect(args.onClick).toHaveBeenCalled()
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Secondary Action</DsButton>'
  })
}

export const Ghost: Story = {
  args: {
    variant: 'ghost'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Ghost Action</DsButton>'
  })
}

export const Danger: Story = {
  args: {
    variant: 'danger'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Delete Record</DsButton>'
  })
}

export const WithIcons: Story = {
  render: () => ({
    components: { DsButton, DsIcon },
    setup() {
      return { ArrowRight, Trash2 }
    },
    template: `
      <div style="display: flex; gap: 1rem;">
        <DsButton variant="primary">
          Continue
          <template #suffix>
            <DsIcon :icon="ArrowRight" size="sm" />
          </template>
        </DsButton>

        <DsButton variant="danger">
          <template #prefix>
            <DsIcon :icon="Trash2" size="sm" />
          </template>
          Remove
        </DsButton>
      </div>
    `
  })
}

export const Loading: Story = {
  args: {
    loading: true,
    variant: 'primary'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Saving changes</DsButton>'
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button).toBeDisabled()
  }
}

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: 'primary'
  },
  render: (args) => ({
    components: { DsButton },
    setup() {
      return { args }
    },
    template: '<DsButton v-bind="args">Disabled Action</DsButton>'
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(args.onClick).not.toHaveBeenCalled()
  }
}

export const IconOnly: Story = {
  render: () => ({
    components: { DsButton, DsIcon },
    setup() {
      return { Trash2 }
    },
    template: `
      <DsButton variant="danger" aria-label="Delete item">
        <template #prefix>
          <DsIcon :icon="Trash2" size="sm" />
        </template>
      </DsButton>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /delete item/i })
    expect(button).not.toBeNull()
  }
}

export const LongContentEdgeCase: Story = {
  render: () => ({
    components: { DsButton },
    template: `
      <div style="max-inline-size: 20rem; border: 1px dashed #ccc; padding: 1rem;">
        <DsButton variant="secondary" full-width>
          Very long action title that should truncate or wrap cleanly within thirty characters
        </DsButton>
      </div>
    `
  })
}
