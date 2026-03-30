import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    includeSource: ["src/**/*.ts"],
    setupFiles: ["tests/setup.ts"],
    typecheck: {
      enabled: true,
      tsconfig: "tsconfig.spec.json",
    },
  },
});
