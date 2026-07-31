const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "image.aladin.co.kr",
      },
      {
        protocol: "https",
        hostname: "*.image.aladin.co.kr",
      },
    ],
  },
};

export default nextConfig;
