/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
    SPOONACULAR_BASE_URL: process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com/recipes',
    SPOONACULAR_RATE_LIMIT: process.env.SPOONACULAR_RATE_LIMIT || '5000',
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
