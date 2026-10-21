import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  sassOptions: { loadPaths: [path.join(process.cwd(), "src/styles")] },
  // Retired per-role gateway URLs now land on the single sign-in page.
  async redirects() {
    return [{ source: "/login/:path+", destination: "/login", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
