// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.strapiapp.com https://excellent-nurture-beee0f6ec0.strapiapp.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;