/**
 * OpenTelemetry distributed tracing (COMP-038.3).
 *
 * Initializes the Node.js SDK with auto-instrumentation and OTLP export.
 * Call initTracing() once at process startup (API, workers, Next.js instrumentation).
 *
 * Architecture: ARCH-009, cross-cutting/observability/ARCHITECTURE.md
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";

const SERVICE_NAME_ATTR = "service.name";

export interface TracingOptions {
  /** Service name for the tracer (e.g. 'api', 'workers'). */
  serviceName: string;
  /**
   * OTLP HTTP endpoint for traces (e.g. http://localhost:4318/v1/traces).
   * Defaults to OTEL_EXPORTER_OTLP_ENDPOINT or Jaeger-all-in-one default.
   */
  endpoint?: string;
  /**
   * Sampling ratio in production (0-1). Dev uses 100% when not set.
   * Can override with OTEL_TRACES_SAMPLER_ARG.
   */
  samplingRatio?: number;
  /**
   * Optional custom exporter (e.g. no-op in tests to avoid network).
   * Must implement export(), shutdown(), forceFlush().
   */
  spanExporter?: {
    export: (spans: unknown) => Promise<{ code: number }>;
    shutdown: () => Promise<void>;
    forceFlush: () => Promise<void>;
  };
}

let sdk: NodeSDK | null = null;

/**
 * Initializes OpenTelemetry tracing. Safe to call multiple times; only the
 * first call starts the SDK. Uses auto-instrumentation for HTTP, pg, Redis, Kafka.
 *
 * @param options - Service name and optional endpoint/sampling.
 */
export function initTracing(options: TracingOptions): void {
  if (sdk != null) return;

  const serviceName = options.serviceName || "syntropy";
  const endpoint =
    options.endpoint ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    "http://localhost:4318";

  const resource = new Resource({
    [SERVICE_NAME_ATTR]: serviceName,
  });

  const traceExporter =
    options.spanExporter ??
    new OTLPTraceExporter({
      url: endpoint.endsWith("/v1/traces") ? endpoint : `${endpoint}/v1/traces`,
    });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}

/**
 * Shuts down the tracing SDK (flushes spans). Call during graceful shutdown.
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}
