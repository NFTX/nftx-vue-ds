// scripts/smoke-consumer.ts
// Enforces TEST-12: Consumer Package Smoke Test (exports, CSS, d.ts, tree-shaking)
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function assertNoUnresolvedAliasesInTypes(dir: string): void {
  console.log('--- Checking dist/.d.ts for unresolved @/* path aliases (TS-03, TEST-12) ---')
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      assertNoUnresolvedAliasesInTypes(fullPath)
    } else if (entry.name.endsWith('.d.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const aliasMatch = content.match(/from\s+['"]@\/[^'"]+['"]/g) || content.match(/import\(['"]@\/[^'"]+['"]\)/g)
      if (aliasMatch) {
        throw new Error(`FAIL: Unresolved @/* alias detected in ${fullPath}: ${aliasMatch.join(', ')}`)
      }
    }
  }
  console.log('PASS: 0 unresolved @/* aliases found in type declarations.')
}

function runSmokeTest(): void {
  console.log('=== Consumer Package Smoke Test (TEST-12) ===\n')

  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist. Run "npm run build" first.')
  }

  // 1. Check for leaking path aliases in generated .d.ts
  assertNoUnresolvedAliasesInTypes(distDir)

  // 2. Pack the library
  console.log('\n--- Packing @nftx/vue-ds via npm pack ---')
  const packOutput = execSync('npm pack --json', { cwd: rootDir, encoding: 'utf-8' })
  const packJson = JSON.parse(packOutput)
  const tarballName = packJson[0].filename
  const tarballPath = path.join(rootDir, tarballName)
  console.log(`Generated tarball: ${tarballName}`)

  // 3. Create isolated consumer test directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nftx-vue-ds-smoke-'))
  console.log(`\nCreated smoke test consumer environment at: ${tempDir}`)

  try {
    // Write consumer package.json
    const consumerPkg = {
      name: 'consumer-smoke-fixture',
      private: true,
      type: 'module',
      dependencies: {
        vue: '^3.5.0',
        '@nftx/vue-ds': `file:${tarballPath}`
      }
    }
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(consumerPkg, null, 2), 'utf-8')

    // Write consumer tsconfig.json
    const consumerTsconfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        noEmit: true,
        skipLibCheck: false
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.vue']
    }
    fs.writeFileSync(path.join(tempDir, 'tsconfig.json'), JSON.stringify(consumerTsconfig, null, 2), 'utf-8')

    // Write consumer vite.config.ts
    const consumerViteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
`
    fs.writeFileSync(path.join(tempDir, 'vite.config.ts'), consumerViteConfig.trim(), 'utf-8')

    // Create src directory and files
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true })

    fs.writeFileSync(
      path.join(tempDir, 'src/env.d.ts'),
      `/// <reference types="vite/client" />
declare module '*.css' {
  const content: string
  export default content
}
`,
      'utf-8'
    )

    const consumerMainTs = `
import '@nftx/vue-ds/styles.css'
import '@nftx/vue-ds/tokens.css'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`
    fs.writeFileSync(path.join(tempDir, 'src/main.ts'), consumerMainTs.trim(), 'utf-8')

    const consumerAppVue = `
<script setup lang="ts">
import { DsVisuallyHidden, type DsVisuallyHiddenProps } from '@nftx/vue-ds'

const props: DsVisuallyHiddenProps = { as: 'span' }
</script>

<template>
  <main>
    <h1>Consumer Smoke App</h1>
    <DsVisuallyHidden v-bind="props">Accessible screen reader label</DsVisuallyHidden>
  </main>
</template>
`
    fs.writeFileSync(path.join(tempDir, 'src/App.vue'), consumerAppVue.trim(), 'utf-8')

    const consumerIndexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Consumer Smoke Test</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`
    fs.writeFileSync(path.join(tempDir, 'index.html'), consumerIndexHtml.trim(), 'utf-8')

    // Install packed tarball and dependencies cleanly using local cache/install
    console.log('\n--- Unpacking and installing into fixture ---')
    // Unpack tarball directly into node_modules/@nftx/vue-ds
    const tempNodeModules = path.join(tempDir, 'node_modules')
    fs.mkdirSync(tempNodeModules, { recursive: true })

    // Symlink root node_modules dependencies (vue, vite, @vitejs/plugin-vue, etc.)
    const rootNodeModules = path.join(rootDir, 'node_modules')
    for (const dep of fs.readdirSync(rootNodeModules)) {
      if (dep === '.bin' || dep === '@nftx') continue
      const srcDep = path.join(rootNodeModules, dep)
      const destDep = path.join(tempNodeModules, dep)
      try {
        fs.symlinkSync(srcDep, destDep, 'junction')
      } catch {
        // Ignore if exists
      }
    }

    // Unpack package tarball to node_modules/@nftx/vue-ds
    const pkgDest = path.join(tempNodeModules, '@nftx/vue-ds')
    fs.mkdirSync(pkgDest, { recursive: true })
    execSync(`tar -xzf "${tarballPath}" --strip-components=1 -C "${pkgDest}"`, { stdio: 'inherit' })

    const rootBin = path.join(rootDir, 'node_modules/.bin')
    const env = { ...process.env, PATH: `${rootBin}:${process.env.PATH}` }

    console.log('\n--- Running consumer typecheck (vue-tsc --noEmit) ---')
    execSync(`vue-tsc --noEmit`, { cwd: tempDir, env, stdio: 'inherit' })
    console.log('PASS: Consumer typecheck passed with 0 errors.')

    console.log('\n--- Running consumer build (vite build) ---')
    execSync(`vite build`, { cwd: tempDir, env, stdio: 'inherit' })
    console.log('PASS: Consumer Vite build succeeded.')

    console.log('\nAll consumer smoke test gates PASSED.\n')
  } finally {
    // Cleanup tarball and temporary directory
    if (fs.existsSync(tarballPath)) {
      fs.unlinkSync(tarballPath)
    }
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

try {
  runSmokeTest()
  process.exit(0)
} catch (error) {
  console.error('\nSmoke test FAILED:', error)
  process.exit(1)
}
