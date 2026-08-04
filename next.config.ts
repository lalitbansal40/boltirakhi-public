import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Product and category images are served straight from the media bucket —
     * those two prefixes are public-read.
     *
     * Without this entry every next/image call fails with "hostname is not
     * configured", and it fails at runtime rather than at build, so a page
     * looks fine until somebody opens it.
     *
     * Putting a CDN in front of the bucket later needs a second entry here.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "boltirakhi-media.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
