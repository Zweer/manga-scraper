import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Use Vitest globals (e.g., expect, describe, it)
    environment: 'node', // Explicitly set the environment
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'], // Coverage reporters
      reportsDirectory: './coverage', // Directory for coverage reports
    },
  },
})
