import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import * as sass from 'sass'
import * as fs from 'node:fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

function buildTokensCssPlugin(): Plugin {
  return {
    name: 'build-tokens-css',
    closeBundle() {
      const tokensScssPath = resolve(__dirname, 'src/styles/tokens/tokens.scss')
      if (fs.existsSync(tokensScssPath)) {
        const outDir = resolve(__dirname, 'dist')
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true })
        }
        const result = sass.compile(tokensScssPath, {
          style: 'expanded',
          loadPaths: [resolve(__dirname, 'src/styles')]
        })
        fs.writeFileSync(resolve(outDir, 'tokens.css'), result.css, 'utf-8')
      }
    }
  }
}

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'search'
        }
      }
    }),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      include: ['src/**/*.ts', 'src/**/*.vue']
    }),
    buildTokensCssPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NftxVueDs',
      fileName: () => 'index.js',
      formats: ['es']
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles.css'
          }
          return assetInfo.name || '[name][extname]'
        }
      }
    }
  }
})
