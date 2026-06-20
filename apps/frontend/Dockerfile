FROM node:24.7-alpine AS base
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"

# Install dependencies only when needed
FROM base AS deps
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

# Rebuild the source code only when needed
FROM base AS builder
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm --version
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /etc/justflow \
    && chown -R nextjs:nodejs /etc/justflow

VOLUME [ "/etc/justflow" ]

USER nextjs

ENV NODE_ENV=production

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]