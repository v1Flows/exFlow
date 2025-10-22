FROM golang:1.24-alpine as builder

WORKDIR /app/backend

COPY services/backend/go.mod services/backend/go.sum ./
RUN go mod download

COPY services/backend/ ./

# Build
RUN go build -o justflow-backend

FROM alpine:3.22 as runner
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
