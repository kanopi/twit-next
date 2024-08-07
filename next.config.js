/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NEXT_IMAGE_DOMAIN,
        pathname: "/sites/default/files/**",
      },
    ],
  },
};

module.exports = nextConfig
