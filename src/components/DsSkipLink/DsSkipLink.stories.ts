import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import DsSkipLink from './DsSkipLink.vue'

/**
 * `DsSkipLink` provides an accessible landmark bypass mechanism conforming to
 * WCAG 2.2 SC 2.4.1 (Bypass Blocks). It is visually off-screen by default and becomes
 * prominently visible upon keyboard focus.
 *
 * ### Keyboard Contract
 * | Key | Target | Result |
 * | :--- | :--- | :--- |
 * | `Tab` | Document root | Focuses the skip link as the first interactive element |
 * | `Enter` / `Space` | Skip link | Jumps focus and smoothly scrolls to the target landmark |
 */
const meta = {
  title: 'Organisms/DsSkipLink',
  component: DsSkipLink,
  tags: ['autodocs'],
  argTypes: {
    targetId: {
      control: 'text',
      description: 'HTML element ID to jump to'
    },
    href: {
      control: 'text',
      description: 'Explicit anchor href (overrides targetId)'
    }
  }
} satisfies Meta<typeof DsSkipLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    targetId: 'main-content'
  },
  render: (args) => ({
    components: { DsSkipLink },
    setup() {
      return { args }
    },
    template: `
      <div>
        <p style="margin-block-end: 1rem; color: var(--ds-color-text-secondary);">
          Press <kbd>Tab</kbd> to reveal the skip link.
        </p>
        <DsSkipLink v-bind="args" />
        <main id="main-content" style="padding: 1rem; border: 1px dashed var(--ds-color-border-interactive); margin-block-start: 2rem;">
          <h2>Main Content Landmark</h2>
          <p>Destination container reached after activating the skip link.</p>
        </main>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('.ds-skip-link')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('#main-content')
  }
}

export const CustomTarget: Story = {
  args: {
    targetId: 'search-section'
  },
  render: (args) => ({
    components: { DsSkipLink },
    setup() {
      return { args }
    },
    template: `
      <div>
        <DsSkipLink v-bind="args">Skip directly to search</DsSkipLink>
        <div id="search-section" style="padding: 1rem; margin-block-start: 2rem; border: 1px solid var(--ds-color-border-default);">
          <h3>Search Controls</h3>
        </div>
      </div>
    `
  })
}

export const LongContentEdgeCase: Story = {
  args: {
    targetId: 'main-content'
  },
  render: (args) => ({
    components: { DsSkipLink },
    setup() {
      return { args }
    },
    template: `
      <div>
        <DsSkipLink v-bind="args">
          Skip over 50 navigation menus and header banners directly to primary homelab service configuration landmark
        </DsSkipLink>
        <div id="main-content" style="margin-block-start: 2rem;">Target Landmark</div>
      </div>
    `
  })
}

export const KeyboardInteraction: Story = {
  args: {
    targetId: 'interactive-target'
  },
  render: (args) => ({
    components: { DsSkipLink },
    setup() {
      return { args }
    },
    template: `
      <div>
        <DsSkipLink v-bind="args" />
        <div id="interactive-target" style="padding: 1rem; margin-block-start: 2rem; border: 1px solid var(--ds-color-border-default);">
          <h3>Interactive Content Landmark</h3>
        </div>
      </div>
    `
  }),
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLAnchorElement>('.ds-skip-link')
    expect(link).not.toBeNull()
    if (link) {
      link.focus()
      expect(link).toHaveFocus()
      await userEvent.click(link)
      const target = canvasElement.querySelector<HTMLElement>('#interactive-target')
      expect(target).toHaveFocus()
    }
  }
}
