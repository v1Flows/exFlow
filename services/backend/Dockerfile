FROM golang:1.24-alpine as builder

WORKDIR /backend

COPY services/backend/go.mod services/backend/go.sum ./
RUN go mod download

COPY services/backend/ ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /exflow-backend

FROM alpine:3.12 as runner
WORKDIR /app

COPY --from=builder /exflow-backend /exflow-backend

RUN mkdir /app/config
COPY services/backend/config/config.yaml /etc/exflow/backend_config.yaml

VOLUME [ "/etc/exflow" ]

EXPOSE 8080

CMD [ "/exflow-backend", "--config", "/etc/exflow/backend_config.yaml" ]
