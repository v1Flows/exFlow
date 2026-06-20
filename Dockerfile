FROM node:24.16.0-alpine AS base

# Stage 1: Build the frontend
FROM node:24.16.0-alpine AS frontend-builder

RUN apk add --no-cache libc6-compat
WORKDIR /app/frontend
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml apps/frontend/pnpm-workspace.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY apps/frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Stage 2: Build the backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/backend
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download
COPY apps/backend/ ./
RUN go build -o justflow-backend

# Stage 3: Create the final image
FROM base AS runner
WORKDIR /app

# Install necessary packages
RUN apk update && apk add --no-cache \
    ca-certificates \
    tini \
    postgresql-client

# Create user and group
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy the backend binary
COPY --from=backend-builder /app/backend/justflow-backend /app/

# Copy the frontend build
COPY --from=frontend-builder /app/frontend/public /app/public

# Set the correct permission for prerender cache
RUN mkdir .next \
    && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

RUN mkdir -p /etc/justflow \
    && chown -R nextjs:nodejs /etc/justflow

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=http://localhost:8080

VOLUME [ "/etc/justflow" ]

# Expose ports
EXPOSE 8080 3000

USER nextjs

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Use tini as the entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start using the entrypoint script
CMD ["/app/entrypoint.sh"]