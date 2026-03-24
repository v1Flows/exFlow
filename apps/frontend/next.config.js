const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({
  path: '/etc/justflow/.env',
});

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    output: 'standalone',
    serverExternalPackages: [
      '@opentelemetry/exporter-trace-otlp-grpc',
      '@opentelemetry/sdk-node',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-trace-node',
      '@opentelemetry/instrumentation',
      'require-in-the-middle',
    ],
    trailingSlash: false,
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    reactStrictMode: true,
    images: {
      unoptimized: true,
      domains: ['localhost', 'justlab.app'],
    },
  };
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import('@serwist/next')).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js',
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};
