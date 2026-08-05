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

  /**
   * /returns is the same policy as /refunds, and there is only one page for it.
   *
   * Done here rather than with permanentRedirect() inside the route. Next
   * streams a page response, so a redirect called during render goes out as a
   * 200 with the redirect buried in the stream — the browser follows it, but
   * curl and a crawler both see an empty 200. A redirect declared here is
   * answered at the routing layer as a real 308, before anything renders.
   */
  async redirects() {
    return [{ source: '/returns', destination: '/refunds', permanent: true }];
  },
};

export default nextConfig;
