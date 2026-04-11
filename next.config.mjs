const nextConfig = {
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