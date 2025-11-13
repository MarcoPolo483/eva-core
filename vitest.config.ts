import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 70,
      // Exclude non-executable or type-only surfaces so coverage reflects runnable code
      exclude: [
        "src/index.ts",            // re-exports only
        "src/spi/**",              // interfaces / contracts only
        "src/domain/messages.ts",  // types only
        "src/examples/**"          // demo code
      ]
    },
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    globals: true
  }
});