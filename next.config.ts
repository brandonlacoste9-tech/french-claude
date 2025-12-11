import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Experimental features for Next.js 15
  experimental: {
    // Enable React 19 features
    reactCompiler: true,
    // Partial Prerendering for hybrid static/dynamic
    ppr: true,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Fal.ai generated images
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: '*.fal.media',
      },
      // Replicate (backup image gen)
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      // Placeholder images for dev
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    // Modern formats
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      // Redirect old paths if needed
      {
        source: '/home',
        destination: '/feed',
        permanent: true,
      },
    ];
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_NAME: 'Zyeuté',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Turbopack for faster dev
  // turbopack: {}, // Uncomment when stable
  
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
