import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Standalone on purpose: vite.config.ts uses @lovable.dev/vite-tanstack-config,
// which pulls in tanstackStart + nitro + the router plugin. Unit tests cover
// pure clinical logic (src/lib/*, store reducers) and must not boot that chain.
//
// The @/* alias mirrors tsconfig.json's paths — keep the two in sync.
export default defineConfig({
  test: {
    // No DOM: nothing under tests/unit renders React.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
