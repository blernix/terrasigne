/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;