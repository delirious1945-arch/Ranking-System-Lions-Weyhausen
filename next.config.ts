import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/update-snapshot": ["./node_modules/@sparticuz/chromium/bin/*"],
  },
};

export default nextConfig;

// Trigger Next.js Dev Server Hard Reload for Prisma Schema update
