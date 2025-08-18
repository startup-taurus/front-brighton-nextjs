const nextConfig = {
  distDir: 'build',
  env: {
    // API_URL: 'http://192.168.100.75:3001/v1/api',
    API_URL: 'https://api-sistema.bebrighton.net/v1/api',
    FILE_URL: 'https://api-sistema.bebrighton.net',
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
