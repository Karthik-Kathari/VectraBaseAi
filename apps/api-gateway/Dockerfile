# Multi-Stage Production Dockerfile for VectraBase AI — API Gateway
# Author: Karthik Kathari (github.com/Karthik-Kathari)

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@12.18.0

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/api-gateway ./apps/api-gateway

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vectrabase/shared-types build
RUN cd apps/api-gateway && pnpm prisma generate
RUN cd apps/api-gateway && pnpm build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production essentials
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --from=builder /app/apps/api-gateway/prisma ./apps/api-gateway/prisma
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json

USER expressjs

EXPOSE 4000

CMD ["node", "apps/api-gateway/dist/index.js"]
