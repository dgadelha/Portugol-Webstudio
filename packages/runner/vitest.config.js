import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    includeSource: ["src/**/*.ts"],
    testTimeout: 30_000,
    typecheck: {
      enabled: true,
      tsconfig: "tsconfig.spec.json",
    },
  },
});
