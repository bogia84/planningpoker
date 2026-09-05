import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

// Point the local dev D1 emulation at the same persisted state the realtime
// worker's `wrangler dev` uses (apps/realtime/.wrangler/state/v3), since both
// workers bind the same D1 database in production and need to see the same
// data locally too.
initOpenNextCloudflareForDev({
  persist: { path: "../realtime/.wrangler/state/v3" },
});

export default nextConfig;
