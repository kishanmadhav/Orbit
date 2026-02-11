/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for S3 hosting
  trailingSlash: true, // Generates /page/index.html for S3 compatibility
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'post-to-x-bucket.s3.eu-north-1.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
