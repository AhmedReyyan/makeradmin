import type { NextConfig } from "next";
require('dotenv').config({ path: '.env.local' });

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/makeradmin',
  },
};

export default nextConfig;
