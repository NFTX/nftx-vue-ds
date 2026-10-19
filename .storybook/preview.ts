import type { Preview } from '@storybook/vue3-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import '@/styles/_index.scss'

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error'
    },
    viewport: {
      viewports: {
        reflow320: {
          name: '320px Reflow (WCAG 1.4.10)',
          styles: { width: '320px', height: '568px' }
        },
        mobile: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '667px' }
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' }
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '800px' }
        }
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark'
      },
      defaultTheme: 'light',
      attributeName: 'data-theme'
    })
  ]
}

export default preview
