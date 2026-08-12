// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['afautal.agustindev.online'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://strapi-afautal.telepyme.cl;"
          }
        ]
      },
    ];
  },
};

export default nextConfig;