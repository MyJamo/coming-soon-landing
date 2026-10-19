// The waitlist, as a Vercel Function next to the page: POST /api/waitlist puts an address into the
// Neon Postgres the Vercel Marketplace integration provisions (it sets DATABASE_URL).
import pg from 'pg';

/**
 * Deliberately loose, as the backend's was: one `@`, no whitespace, a dot in the domain. The mail
 * that reaches the address proves it; a stricter pattern only turns away real ones.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_EMAIL = 254;
const SOURCES = new Set(['hero', 'footer']);
const LOCALES = new Set(['ru', 'uz-Latn', 'en']);

// One connection per instance: a signup is one statement, and Neon's pooled URL does the fan-in.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, idleTimeoutMillis: 10_000 });

// Created on an instance's first signup, so a fresh database needs no setup step.
let ready: Promise<unknown> | null = null;
const table = () => (ready ??= pool.query(`
  CREATE TABLE IF NOT EXISTS waitlist_signups (
    email      text PRIMARY KEY,
    source     text NOT NULL,
    locale     text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`).catch((e) => { ready = null; throw e; }));

/** 204 for a new address and a known one alike, so the answer never says who is on the list. */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { email?: unknown; source?: unknown; locale?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const source = String(body?.source), locale = String(body?.locale);
  if (email.length > MAX_EMAIL || !EMAIL.test(email) || !SOURCES.has(source) || !LOCALES.has(locale)) {
    return new Response(null, { status: 400 });
  }
  try {
    await table();
    // A second signup is the same fact as the first, so the first row keeps its source and moment.
    await pool.query(
      'INSERT INTO waitlist_signups (email, source, locale) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [email, source, locale],
    );
  } catch (e) {
    console.error('waitlist insert failed', e);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
