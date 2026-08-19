import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the app from /Icestream/
export default defineConfig({
  base: '/Icestream/',
  plugins: [react()],
})
