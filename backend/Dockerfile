# Multi-stage build for backend service

# 1) Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 2) Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install minimal tools
RUN apk add --no-cache curl

# Only install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifact from builder
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

CMD ["node", "dist/index.js"]


