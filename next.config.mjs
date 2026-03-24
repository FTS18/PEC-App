/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // Cloudinary image support
    unoptimized: false,
  },
  // Webpack configuration for compatibility
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      canvas: false, // Fix pdfjs-dist canvas error
    };
    
    // Fix for pdfjs-dist
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    return config;
  },
  // Support for markdown and other extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Transpile certain packages if needed
  transpilePackages: [
    'three',
    'gsap',
    'recharts',
  ],
};

export default nextConfig;
