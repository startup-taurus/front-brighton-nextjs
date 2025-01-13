const nextConfig = {
  env: {
     API_URL: "http://localhost:3000/v1/api",
    //API_URL: "https://devbrighton.zgamestechnology.com/v1/api",
    FILE_URL: "https://devbrighton.zgamestechnology.com",
  },
  images: {
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
