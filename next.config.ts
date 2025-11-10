import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "store.storeimages.cdn-apple.com",
      "profile.line-scdn.net",
      "cdn.simpleicons.org",
      "applehouseth.com",
    ],
  },

  reactStrictMode: false,
};

export default nextConfig;
