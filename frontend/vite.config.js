import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the React frontend.
export default defineConfig({
  // React plugin enables JSX transform and fast refresh.
  plugins: [react()],
  // Keep the dev port explicit for consistent CORS setup.
  server: {
    port: 5173,
  },
})
