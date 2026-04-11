import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    includeSource: ["src/**/*.ts"],
    typecheck: {
      enabled: true,
      tsconfig: "tsconfig.spec.json",
    },
    disableConsoleIntercept: true,
  },
});
