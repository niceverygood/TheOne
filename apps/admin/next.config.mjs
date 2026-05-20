/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@theone/shared', '@theone/db'],
};

export default nextConfig;
