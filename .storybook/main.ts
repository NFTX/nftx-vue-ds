import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: [
    '../src/docs/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  features: {
    experimentalDocgenServer: true
  },
  // vite.config.ts is the library build: its declaration and tokens plugins
  // would write .d.ts files into storybook-static and rewrite dist/
  viteFinal(viteConfig) {
    const libraryOnly = new Set(['unplugin-dts', 'build-tokens-css'])
    viteConfig.plugins = (viteConfig.plugins ?? [])
      .flat()
      .filter((plugin) => !(plugin && 'name' in plugin && libraryOnly.has(plugin.name)))
    return viteConfig
  }
}

export default config
