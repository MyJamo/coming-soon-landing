import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// On Vercel, api/waitlist.ts is a Function. In dev the same module answers through Vite's server,
// against DATABASE_URL from .env.local (`vercel env pull`, or any local Postgres).
function waitlistApi(): Plugin {
  return {
    name: 'waitlist-api',
    configureServer(server) {
      server.middlewares.use('/api/waitlist', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const { POST } = await server.ssrLoadModule('/api/waitlist.ts');
        const reply: Response = await POST(new Request('http://localhost/api/waitlist', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: Buffer.concat(chunks),
        }));
        res.statusCode = reply.status;
        res.end(await reply.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  process.env.DATABASE_URL ??= loadEnv(mode, process.cwd(), '').DATABASE_URL;
  return {
    plugins: [react(), waitlistApi()],
    server: { port: 5191, strictPort: true },
  };
});
