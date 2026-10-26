import { defineConfig } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

// Load .env and .env.local if present
dotenv.config();
dotenv.config({ path: '.env.local' });

export default defineConfig({
  root: './',
  publicDir: 'public',
  server: {
    port: 5173,
    open: false,
    // Custom middleware to handle /api/* serverless functions during local development
    proxy: {},
  },
  plugins: [
    {
      name: 'api-serverless-dev-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api/')) {
            return next();
          }

          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const pathname = parsedUrl.pathname;

          try {
            if (pathname === '/api/public-config') {
              const handler = (await import('./api/public-config.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/mandi-prices') {
              const handler = (await import('./api/mandi-prices.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/weather') {
              const handler = (await import('./api/weather.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/health/data-sources') {
              const handler = (await import('./api/health/data-sources.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/payment/create-order') {
              const handler = (await import('./api/payment/create-order.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/payment/verify') {
              const handler = (await import('./api/payment/verify.js')).default;
              return handler(req, res);
            }
            if (pathname === '/api/payment/webhook') {
              const handler = (await import('./api/payment/webhook.js')).default;
              return handler(req, res);
            }
          } catch (err) {
            console.error('Error executing API handler for', pathname, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
