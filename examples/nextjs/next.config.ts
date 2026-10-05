import type { NextConfig } from "next";
const config: NextConfig = { serverExternalPackages: ["sharp"], experimental: { externalDir: true } };
export default config;
