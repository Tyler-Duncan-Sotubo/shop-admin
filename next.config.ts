import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "centa-hr.s3.amazonaws.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
