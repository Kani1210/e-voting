const nextConfig = {
  experimental: {
    turbopack: false,
  },
  async rewrites() {
    return [
      {
        source: "/marvisauth/:path*",
        destination: "http://localhost:8031/marvisauth/:path*",
      },
    ];
  },
};

export default nextConfig;