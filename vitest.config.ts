import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const storybookPlugins = await storybookTest({
  configDir: resolve(__dirname, '.storybook')
})

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'search'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['vue', 'storybook/test', '@storybook/vue3', '@storybook/vue3-vite']
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*.{ts,vue,html}', 'src/composables/**', 'src/utils/**'],
      exclude: [
        '**/*.stories.ts',
        '**/*.spec.ts',
        '**/index.ts',
        '**/*.scss',
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
        'src/composables/**': {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 95
        }
      }
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true
          }
        }
      },
      {
        plugins: [...storybookPlugins],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true
          }
        }
      }
    ]
  }
})
