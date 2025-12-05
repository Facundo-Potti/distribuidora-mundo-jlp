/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Desactivar optimización para evitar problemas en Vercel
    // Las imágenes se cargarán directamente sin pasar por el optimizador de Next.js
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Optimizaciones de rendimiento
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig

