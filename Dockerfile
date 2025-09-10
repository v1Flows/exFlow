FROM node:24-alpine AS base

# Stage 1: Build the frontend
FROM node:24-alpine AS frontend-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app/frontend
COPY services/frontend/package.json services/frontend/pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm --version
RUN pnpm install
COPY services/frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# Stage 2: Build the backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app/backend
COPY services/backend/go.mod services/backend/go.sum ./
RUN go mod download
COPY services/backend/ ./
RUN go build -o exflow-backend

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

# Copy the frontend build
COPY --from=frontend-builder /app/frontend/public /app/public

# Set the correct permission for prerender cache
RUN mkdir .next \
    && chown nextjs:nodejs .next

# Copy the backend build
COPY --from=backend-builder /app/backend/exflow-backend /app/exflow-backend

# Automatically leverage output traces to reduce image size
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static

# Create directories and set proper permissions
RUN mkdir -p /etc/exflow && chown nextjs:nodejs /etc/exflow
RUN mkdir -p /app/frontend && chown nextjs:nodejs /app/frontend
RUN chown -R nextjs:nodejs /app

# Create startup script to handle config file persistence
COPY --chown=nextjs:nodejs <<'EOF' /app/start.sh
#!/bin/sh

# Function to restore config files from persistent volume if they exist
restore_configs() {
    if [ -f "/etc/exflow/config.yaml" ]; then
        cp /etc/exflow/config.yaml /app/config.yaml
        echo "Restored backend config from persistent volume"
    fi
    
    if [ -f "/etc/exflow/frontend.env" ]; then
        cp /etc/exflow/frontend.env /app/frontend/.env
        echo "Restored frontend .env from persistent volume"
    fi
}

# Function to backup config files to persistent volume
backup_configs() {
    while true; do
        if [ -f "/app/config.yaml" ]; then
            cp /app/config.yaml /etc/exflow/config.yaml
        fi
        
        if [ -f "/app/frontend/.env" ]; then
            cp /app/frontend/.env /etc/exflow/frontend.env
        fi
        
        sleep 10
    done
}

# Restore existing configs on startup
restore_configs

# Start background process to continuously backup new config files
backup_configs &

# Start the applications
if [ -f "/etc/exflow/config.yaml" ]; then
    /app/exflow-backend --config /etc/exflow/config.yaml &
else
    /app/exflow-backend &
fi

node /app/server.js
EOF

RUN chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production

VOLUME [ "/etc/exflow" ]

# Expose ports
EXPOSE 8080 3000

USER nextjs

# Use tini as the entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start with our custom script
CMD ["/app/start.sh"]