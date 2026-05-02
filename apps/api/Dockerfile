# Build stage: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Build stage: compile the code (e.g., TypeScript)
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Runtime stage: setup production app
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

# Set NODE_ENV to production
ENV NODE_ENV=production

# Switch to non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]