/** @type {import('next').NextConfig} */

const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; connect-src 'self' https://vitals.vercel-insights.com; upgrade-insecure-requests;";

const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/extension', destination: '/en/extension', permanent: true },
      { source: '/guide', destination: '/en/guide', permanent: true },
      {
        source: '/privacy',
        destination: '/en/privacy',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/en/terms',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
