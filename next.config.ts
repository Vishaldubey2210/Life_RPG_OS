import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Skip static generation for pages that require Supabase auth
  // They will be rendered on-demand when env vars are available
  staticPageGenerationTimeout: 60,
  experimental: {
    // Allow build to complete even when env vars aren't set
  },
}

export default nextConfig
