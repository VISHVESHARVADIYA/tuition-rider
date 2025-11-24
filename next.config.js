/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove static export configuration to enable dynamic APIs
  // output: 'export',
  distDir: '.next',
  images: {
    // Enable image optimization for dynamic deployment
    // unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'randomuser.me' }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Explicitly set the pageExtensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],
  // Configure server actions to allow larger request bodies
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Increase the body size limit to 4MB
    }
  },
  // Moved to root level as per Next.js recommendation
  outputFileTracingExcludes: {
    '**/node_modules/@swc/core-linux-x64-gnu/**': ['**/*']
  },

  // Special directory handling for Vercel deployments
  transpilePackages: ['lucide-react'],
  
  // Add custom rewrites to fix API endpoint issues
  async rewrites() {
    return [
      // API rewrites
      {
        source: '/api/admin-new/resources',
        destination: '/api/resources',
      },
      {
        source: '/api/resources-new/:id',
        destination: '/api/resources/:id',
      },
      {
        source: '/api/resources-new/download/:id',
        destination: '/api/resources/download/:id',
      },
      // Marketing pages rewrites
      {
        source: '/',
        destination: '/marketing',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-matched-path',
            value: '/:path*',
          },
        ],
        destination: '/marketing/:path*',
      }
    ];
  },
  webpack: (config, { isServer }) => {
    // Add mock modules resolver
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // Add mock modules - using relative paths for Vercel compatibility
    config.resolve.alias['next-auth'] = './.mock-modules/next-auth.js';
    config.resolve.alias['next-auth/next'] = './.mock-modules/next-auth.js';
    config.resolve.alias['next-auth/react'] = './.mock-modules/next-auth.js';
    config.resolve.alias['next-contentlayer/hooks'] = './.mock-modules/next-contentlayer.js';

    // Mock Sentry modules to fix build errors
    config.resolve.alias['@sentry/node'] = './.mock-modules/sentry.js';
    config.resolve.alias['@sentry/nextjs'] = './.mock-modules/sentry.js';

    // Fix for lucide-react
    if (isServer) {
      config.externals = [...(config.externals || []), 'lucide-react'];
    }

    return config;
  }
};

module.exports = nextConfig;