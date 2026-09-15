import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          if (id.includes('node_modules/bootstrap') || id.includes('node_modules/react-bootstrap')) {
            return 'bootstrap'
          }
          if (id.includes('node_modules/@azure/msal')) {
            return 'msal'
          }
          return undefined
        },
      },
    },
  },
})
