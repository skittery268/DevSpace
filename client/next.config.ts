import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Product and category images are stored on Cloudinary by the backend
        // (`utils/uploadToCloudinary.js` returns `secure_url`).
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
            // Seeded demo categories and products still point at Unsplash; real
            // uploads go through Cloudinary above.
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
