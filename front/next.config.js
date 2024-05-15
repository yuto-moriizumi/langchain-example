/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["langchain"],
  },
};

module.exports = nextConfig;
