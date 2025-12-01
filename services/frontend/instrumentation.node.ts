import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import * as otelResources from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

// Some versions of the @opentelemetry/resources package export only type
// declarations in their typings, which can cause a TS error when using
// `new Resource(...)`. Importing the module and constructing the Resource
// at runtime with a safe any-cast avoids the "only refers to a type" error.
const ResourceCtor: any =
  (otelResources as any).Resource ||
  (otelResources as any).default ||
  (otelResources as any);

const sdk = new NodeSDK({
  resource: new ResourceCtor({
    [SemanticResourceAttributes.SERVICE_NAME]: "justflow-frontend",
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.JUSTFLOW_OTEL_COLLECTOR || "http://tempo:4318/v1/traces",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
