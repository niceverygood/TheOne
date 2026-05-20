/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 워크스페이스 패키지를 소스째 트랜스파일
  transpilePackages: ['@theone/shared', '@theone/db'],
  experimental: {
    optimizePackageImports: ['@theone/shared'],
  },
};

export default nextConfig;
