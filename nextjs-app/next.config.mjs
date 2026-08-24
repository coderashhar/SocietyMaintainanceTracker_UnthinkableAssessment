/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Suppress specific warnings from Prisma in serverless
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
