import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "centa-hr.s3.amazonaws.com",
        port: "",
      },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
