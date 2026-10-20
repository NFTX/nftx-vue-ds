# ========================================
# Stage 1: Build Storybook Static Site
# ========================================
FROM node:22-slim AS build

WORKDIR /app

# Copy package manifests first for optimal layer caching
COPY package*.json ./

# Install all dependencies cleanly
RUN npm ci --no-audit --no-fund

# Copy source code and Storybook configuration
COPY . .

# Build the design system library and static Storybook application
RUN npm run build && npm run build-storybook

# ========================================
# Stage 2: Minimal Nginx Runtime Container
# ========================================
FROM nginx:alpine AS final

# Clean default Nginx html directory
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled Storybook static distribution
COPY --from=build /app/storybook-static /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
