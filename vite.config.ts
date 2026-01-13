import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3003,
      host: '0.0.0.0',
      proxy: {
        '/auth': 'http://localhost:3002',
        '/assets': 'http://localhost:3002',
        '/account': 'http://localhost:3002',
        '^/abm/': 'http://localhost:3002',
        '/fractional': 'http://localhost:3002',
        '/swap': 'http://localhost:3002',
        '/pay': 'http://localhost:3002',
        '/yield': 'http://localhost:3002',
        '/wallet': 'http://localhost:3002',
        '/verify': 'http://localhost:3002',
        '/collateral': 'http://localhost:3002'
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
