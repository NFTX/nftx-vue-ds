import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import DsVisuallyHidden from './DsVisuallyHidden.vue'

/**
 * `DsVisuallyHidden` provides screen-reader-only accessible labels or instructions
 * while visually hiding the content from the screen.
 *
 * Conforms to WCAG 2.2 SC 1.3.1 Info and Relationships and SC 4.1.2 Name, Role, Value.
 */
const meta = {
  title: 'Atoms/DsVisuallyHidden',
  component: DsVisuallyHidden,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'text',
      description: 'The semantic HTML element tag to render',
      table: {
        defaultValue: { summary: 'span' }
      }
    }
  }
} satisfies Meta<typeof DsVisuallyHidden>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    as: 'span'
  },
  render: (args) => ({
    components: { DsVisuallyHidden },
    setup() {
      return { args }
    },
    template: `
      <div>
        <p>Visible content before.</p>
        <DsVisuallyHidden v-bind="args">This text is screen-reader only.</DsVisuallyHidden>
        <p>Visible content after.</p>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const hiddenEl = canvas.getByText('This text is screen-reader only.')
    expect(hiddenEl).not.toBeNull()
    const rect = hiddenEl.getBoundingClientRect()
    expect(rect.width).toBeLessThanOrEqual(1)
    expect(rect.height).toBeLessThanOrEqual(1)
  }
}

export const CustomElementTag: Story = {
  args: {
    as: 'h2'
  },
  render: (args) => ({
    components: { DsVisuallyHidden },
    setup() {
      return { args }
    },
    template: `
      <section aria-labelledby="section-heading">
        <DsVisuallyHidden id="section-heading" v-bind="args">Accessible Section Heading</DsVisuallyHidden>
        <p>Section body content.</p>
      </section>
    `
  }),
  play: async ({ canvasElement }) => {
    const h2 = canvasElement.querySelector('h2.ds-visually-hidden')
    expect(h2).not.toBeNull()
    expect(h2?.tagName.toLowerCase()).toBe('h2')
  }
}

export const LongContentEdgeCase: Story = {
  args: {
    as: 'div'
  },
  render: (args) => ({
    components: { DsVisuallyHidden },
    setup() {
      return { args }
    },
    template: `
      <div>
        <DsVisuallyHidden v-bind="args">
          Very long descriptive accessibility message that outlines complex instructions for screen reader users
          without causing horizontal overflow or reflow issues in the layout viewport at 320px width.
        </DsVisuallyHidden>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const hiddenEl = canvasElement.querySelector('.ds-visually-hidden')
    expect(hiddenEl).not.toBeNull()
    if (hiddenEl) {
      const rect = hiddenEl.getBoundingClientRect()
      expect(rect.width).toBeLessThanOrEqual(1)
      expect(rect.height).toBeLessThanOrEqual(1)
    }
  }
}
