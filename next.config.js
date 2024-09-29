const nextConfig = {
  env: {
    API_URL: "http://localhost:3000/v1/api",
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
