import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.integration.test.ts",
      "tests/e2e/**/*.e2e.test.ts",
    ],
    hookTimeout: 60_000,
  },
});
