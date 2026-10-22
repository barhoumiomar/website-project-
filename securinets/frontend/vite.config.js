import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
const target = process.env.API_URL || 'http://localhost:5000';
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': target } } });