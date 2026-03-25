const nextConfig = {
  distDir: 'build',
  env: {
    API_URL: 'https://api-sistema.bebrighton.net/v1/api',
    FILE_URL: 'https://api-sistema.bebrighton.net',
    // API_URL: process.env.API_URL || 'http://localhost:3000/v1/api',
    // FILE_URL: process.env.FILE_URL || 'http://localhost:3000',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-sistema.bebrighton.net',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '**',
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/authentication/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
