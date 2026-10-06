import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product imagery is served by an image CDN (Unsplash/imgix today, the
    // marketplace's own media CDN later). The loader builds sized URLs so the
    // browser fetches exactly the width it needs, straight from the CDN.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  poweredByHeader: false,
};

export default nextConfig;
