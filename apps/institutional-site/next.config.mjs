/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Future: add images.domains for institution logos / OG images when API provides imageUrl
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
