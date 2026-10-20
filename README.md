# @nftx/vue-ds

Standalone Vue 3 + TypeScript component library with framework-agnostic design tokens, WCAG 2.2 Level AA accessibility baseline, crimson-wine primary palette, and bundled Storybook 10 playground.

---

## 🚀 Running Storybook with Docker Compose

To check the design system, view all component stories, and interact with the full homelab demo in an isolated Nginx container:

```bash
# Build and run Storybook container in detached mode
docker compose up -d --build
```

Then open your browser at:
```
http://localhost:6006
```

To stop the container:
```bash
docker compose down
```

### Configuration (.env)

You can customize the host port via `.env` (or environment variables):
```bash
cp .env.example .env
# Edit STORYBOOK_PORT if needed (default: 6006)
```

---

## 💻 Local Development

```bash
# Install dependencies
npm ci

# Launch Storybook in development mode
npm run storybook

# Run full CI quality gate suite
npm run verify

# Build static Storybook site
npm run build-storybook

# Build library bundle and .d.ts
npm run build
```

---

## 📦 Package Distribution

- **Main entry:** `@nftx/vue-ds` (`dist/index.js`, `dist/index.d.ts`)
- **Styles:** `@nftx/vue-ds/styles.css`
- **Tokens only:** `@nftx/vue-ds/tokens.css`
- **SCSS entry:** `@nftx/vue-ds/scss`
