FROM golang:1.24-alpine as builder

WORKDIR /app/backend

COPY services/backend/go.mod services/backend/go.sum ./
RUN go mod download

COPY services/backend/ ./

# Build
RUN go build -o exflow-backend

FROM alpine:3.22 as runner
WORKDIR /app

COPY --from=builder /app/backend/exflow-backend /app/

RUN addgroup --system --gid 1001 exflow
RUN adduser --system --uid 1001 exflow

RUN mkdir -p /etc/exflow \
    && chown -R exflow:exflow /etc/exflow

RUN chown -R exflow:exflow /app

VOLUME [ "/etc/exflow" ]

EXPOSE 8080

CMD [ "/exflow-backend", "--config", "/etc/exflow/config.yaml" ]
