/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  env: {
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
    SPOONACULAR_BASE_URL: process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com/recipes',
    SPOONACULAR_RATE_LIMIT: process.env.SPOONACULAR_RATE_LIMIT || '5000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edamam-product-images.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fdc.nal.usda.gov',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
