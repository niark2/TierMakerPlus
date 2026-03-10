import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["puppeteer-extra", "puppeteer-extra-plugin-stealth"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;
