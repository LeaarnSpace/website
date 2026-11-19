// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  image: {
    // Photos from the back office's media storage (https in production; the back office on this machine locally).
    // The build downloads and resizes them, so the published site serves its own copies.
    remotePatterns: [{ protocol: "https" }, { protocol: "http", hostname: "localhost" }],
  },
});
