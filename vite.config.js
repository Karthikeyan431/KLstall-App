import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // 👈 இது mobile browserக்கு Supabase connect ஆக உதவும்
    port: 5173
  }
})
