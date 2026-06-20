FROM golang:1.26-alpine as builder
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"

WORKDIR /app/backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build
RUN go build -o justflow-backend

FROM alpine:3.24 as runner
LABEL org.opencontainers.image.source = "https://github.com/JustLabV1/justflow"
WORKDIR /app

COPY --from=builder /app/backend/justflow-backend /app/

RUN addgroup --system --gid 1001 justflow
RUN adduser --system --uid 1001 justflow

RUN mkdir -p /etc/justflow \
    && chown -R justflow:justflow /etc/justflow

RUN chown -R justflow:justflow /app

VOLUME [ "/etc/justflow" ]

EXPOSE 8080

CMD [ "/justflow-backend", "--config", "/etc/justflow/config.yaml" ]
