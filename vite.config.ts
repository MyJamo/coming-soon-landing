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

/**
 * Moves the bundle's stylesheet from <head> to the end of <body>, after Jamo's face in index.html. In
 * <head> it holds up the first paint, and on a slow connection the page stays blank until it is in;
 * after the face, the face paints at once. main.tsx keeps the face up until the styles have loaded.
 */
function stylesAfterBoot(): Plugin {
  return {
    name: 'styles-after-boot',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const links = html.match(/<link rel="stylesheet"[^>]*href="\/assets\/[^>]*>/g) ?? [];
        for (const link of links) html = html.replace(link, '');
        return html.replace('</body>', links.join('\n') + '\n</body>');
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  process.env.DATABASE_URL ??= loadEnv(mode, process.cwd(), '').DATABASE_URL;
  return {
    plugins: [react(), waitlistApi(), stylesAfterBoot()],
    server: { port: 5191, strictPort: true },
  };
});
