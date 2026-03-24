FROM golang:1.24 as builder
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"

WORKDIR /workspace

# Update the package list and install git and gcc
RUN apt-get update && apt-get install -y git gcc

COPY go.work ./
COPY apps/backend ./apps/backend
COPY apps/runner ./apps/runner

WORKDIR /workspace/apps/runner
RUN go mod download

# Build the main application
RUN CGO_ENABLED=1 GOOS=linux go build -o /runner ./cmd/runner

# Copy configuration files
RUN mkdir -p /workspace/config
RUN mkdir -p /workspace/plugins
COPY apps/runner/config/config.yaml /workspace/config/config.yaml

# Install Ansible in the final stage
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 python3-pip sshpass && \
    pip3 install --no-cache-dir ansible --break-system-packages && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/config /app/plugins
RUN cp /workspace/config/config.yaml /app/config/config.yaml

VOLUME [ "/app/config", "/app/plugins" ]

EXPOSE 8081

CMD [ "/runner", "-c", "/app/config/config.yaml" ]