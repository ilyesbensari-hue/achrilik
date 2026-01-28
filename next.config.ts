import * as Sentry from "@sentry/nextjs";

const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

// Disable Sentry in CI environment to avoid build failures
if (process.env.CI) {
  module.exports = nextConfig;
} else {
  module.exports = Sentry.withSentryConfig(
    nextConfig,
    {
      org: "achrilik",
      project: "achrilik-web",
      silent: !process.env.CI,
      widenClientFileUpload: true,
      reactComponentAnnotation: {
        enabled: true,
      },
      tunnelRoute: "/monitoring",
      disableLogger: true,
      automaticVercelMonitors: true,
    }
  );
}
