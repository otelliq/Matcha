/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow cross-origin access to Next.js dev resources for preview
  allowedDevOrigins: ['*.vusercontent.net', 'localhost'],
}

export default nextConfig
