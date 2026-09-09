import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Local `npm run dev` parity with the Traefik routing in docker-compose.yml.
    proxy: {
      '/items': 'http://localhost:3000',
      '/auth': 'http://localhost:4000',
      '/login': 'http://localhost:4000',
      '/register': 'http://localhost:4000',
    },
  },
})
