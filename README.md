# Coming soon

The pre-launch page: Claude Design "Coming Soon v2.dc.html" (project
`a3c46b2d-ce89-4dfe-9f7d-2387ee5f0636`), built 1:1 with Vite + React. `src/JamoFace.tsx` is the
design's typed port of `dots/src/components/JamoFace.tsx`, cut down to the moods the page uses.

The additions to the design: the form asks for a phone number first ("Prefer email?" switches it to
an address) and posts `{ phone | email, source: "hero", locale }` to `POST /api/waitlist`, a Vercel
Function (`api/waitlist.ts`) that writes to Neon Postgres. Phones are stored as `+` and digits; nine
digits without a `+` count as an Uzbek number. It answers 204 for a new and a known contact alike,
400 for one it turns away, 500 if the database fails.

Each row holds a phone or an email. The function brings an older email-only table to that shape on
its first signup after a deploy: it adds the `phone` column and swaps the email primary key for
unique indexes, in one transaction, without rewriting or deleting rows.

```sh
npm install
npm run dev      # :5191; /api/waitlist runs in Vite against DATABASE_URL from .env.local
npm run build    # static files in dist/
```

`?lang=uz` or `?lang=en` opens the page in Uzbek or English; Russian is the default.

Google Analytics: property "MyJamo Web" (services@myjamo.com), stream "Coming soon",
`G-81GHWLS3L5`. `src/analytics.ts` loads it in built pages only. A signup sends `generate_lead` with
`method` (phone or email), never the contact itself.

## Deploying on Vercel

1. Import the repo; the Vite preset is detected (build `npm run build`, output `dist`), and
   `api/waitlist.ts` becomes a Function on its own.
2. Storage → Marketplace → **Neon** → connect it to the project. That sets `DATABASE_URL` for every
   environment. The table `waitlist_signups` is created on the first signup.
3. Firewall → add a rate-limit rule on `/api/waitlist` (say 10 requests per minute per IP); the
   Function itself does not limit callers.

Reading the list: Neon's SQL editor, or
`psql "$DATABASE_URL" -c "\copy (SELECT phone, email, locale, source, created_at FROM waitlist_signups ORDER BY created_at) TO 'waitlist.csv' CSV HEADER"`.
