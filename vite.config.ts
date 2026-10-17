import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The waitlist form posts to the backend's /api/v1/waitlist; in dev that is the local jar.
const API = process.env.JAMO_API || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5191, strictPort: true,
    proxy: { '/api': API },
  },
});
