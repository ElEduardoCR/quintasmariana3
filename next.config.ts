import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecugkkqvmiwkemasysvg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/report-photos/**",
      },
    ],
  },
};

export default nextConfig;
