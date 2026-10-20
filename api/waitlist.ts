// The waitlist, as a Vercel Function next to the page: POST /api/waitlist puts a phone number or an
// address into the Neon Postgres the Vercel Marketplace integration provisions (it sets DATABASE_URL).
import pg from 'pg';

/**
 * Deliberately loose, as the backend's was: one `@`, no whitespace, a dot in the domain. The mail
 * that reaches the address proves it; a stricter pattern only turns away real ones.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_EMAIL = 254;
/** Digits with the separators people type between them, and an optional leading `+`. */
const PHONE = /^\+?[\d\s().-]+$/;
const SOURCES = new Set(['hero', 'footer']);
const LOCALES = new Set(['ru', 'uz-Latn', 'en']);

/**
 * The number as `+` and digits. Nine digits are an Uzbek number typed without its +998, the way
 * people here write their own; anything else must carry its country code. E.164 caps it at 15.
 */
function normalizePhone(raw: string): string | null {
  if (!PHONE.test(raw)) return null;
  const digits = raw.replace(/\D/g, '');
  if (!raw.startsWith('+') && digits.length === 9) return `+998${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
}

// One connection per instance: a signup is one statement, and Neon's pooled URL does the fan-in.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, idleTimeoutMillis: 10_000 });

// Set up on an instance's first signup, so a fresh database needs no setup step.
let ready: Promise<unknown> | null = null;
const table = () => (ready ??= setUp().catch((e) => { ready = null; throw e; }));

/**
 * Brings the table to its phone-or-email shape. The first one, from before phones, keyed rows by
 * email; the change only adds a column and swaps that key for unique indexes, so no row is touched.
 */
async function setUp(): Promise<void> {
  const { rowCount } = await pool.query(`
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'waitlist_signups' AND column_name = 'phone'`);
  if (rowCount) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Instances that start together take turns; every step below is a no-op the second time.
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('waitlist_signups'))`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist_signups (
        email      text PRIMARY KEY,
        source     text NOT NULL,
        locale     text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`);
    await client.query('ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS phone text');
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_email_key ON waitlist_signups (email)');
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_phone_key ON waitlist_signups (phone)');
    await client.query('ALTER TABLE waitlist_signups DROP CONSTRAINT IF EXISTS waitlist_signups_pkey');
    await client.query('ALTER TABLE waitlist_signups ALTER COLUMN email DROP NOT NULL');
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'waitlist_signups_contact') THEN
          ALTER TABLE waitlist_signups
            ADD CONSTRAINT waitlist_signups_contact CHECK (phone IS NOT NULL OR email IS NOT NULL);
        END IF;
      END $$`);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** 204 for a new contact and a known one alike, so the answer never says who is on the list. */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as
    { phone?: unknown; email?: unknown; source?: unknown; locale?: unknown } | null;
  const source = String(body?.source), locale = String(body?.locale);
  if (!SOURCES.has(source) || !LOCALES.has(locale)) return new Response(null, { status: 400 });

  // One contact per signup: the phone when it is there, the address otherwise.
  let column: 'phone' | 'email', value: string | null;
  if (typeof body?.phone === 'string') {
    column = 'phone'; value = normalizePhone(body.phone.trim());
  } else {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    column = 'email'; value = email.length <= MAX_EMAIL && EMAIL.test(email) ? email : null;
  }
  if (!value) return new Response(null, { status: 400 });

  try {
    await table();
    // A second signup is the same fact as the first, so the first row keeps its source and moment.
    await pool.query(
      `INSERT INTO waitlist_signups (${column}, source, locale) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [value, source, locale],
    );
  } catch (e) {
    console.error('waitlist insert failed', e);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
