/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prefer TS/TSX over the stale, superseded .jsx/.js duplicates left in
    // src/ and components/ -- see frontend cleanup notes.
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx', '.json'],
  },
  server: {
    proxy: {
      '/items': 'http://backend:3000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx}'],
    },
  },
})
