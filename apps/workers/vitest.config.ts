import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@syntropy/labs-package": resolve(__dirname, "../../packages/labs/dist/index.js"),
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.integration.test.ts"],
    hookTimeout: 90_000,
  },
});
