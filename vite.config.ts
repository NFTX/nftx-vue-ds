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
      const outDir = resolve(__dirname, 'dist')
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
      }

      // 1. Build standalone tokens.css
      const tokensScssPath = resolve(__dirname, 'src/styles/tokens/tokens.scss')
      if (fs.existsSync(tokensScssPath)) {
        const tokensResult = sass.compile(tokensScssPath, {
          style: 'expanded',
          loadPaths: [resolve(__dirname, 'src/styles')]
        })
        fs.writeFileSync(resolve(outDir, 'tokens.css'), tokensResult.css, 'utf-8')
      }

      // 2. Prepend compiled tokens + base CSS to styles.css so it is the complete standalone bundle
      const indexScssPath = resolve(__dirname, 'src/styles/_index.scss')
      if (fs.existsSync(indexScssPath)) {
        const indexResult = sass.compile(indexScssPath, {
          style: 'expanded',
          loadPaths: [resolve(__dirname, 'src/styles')]
        })
        const stylesPath = resolve(outDir, 'styles.css')
        if (fs.existsSync(stylesPath)) {
          const componentCss = fs.readFileSync(stylesPath, 'utf-8')
          fs.writeFileSync(stylesPath, `${indexResult.css}\n${componentCss}`, 'utf-8')
        }
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
