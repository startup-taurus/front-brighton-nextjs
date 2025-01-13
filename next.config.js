const nextConfig = {
  distDir: "build",
  env: {
    //API_URL: "http://localhost:3000/v1/api",
    API_URL: "http://154.12.252.34:5000/v1/api",
    FILE_URL: "http://154.12.252.34:5000",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "devbrighton.zgamestechnology.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/authentication/login",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
