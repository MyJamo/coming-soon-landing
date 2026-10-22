# Landing

MyJamo's landing: the working day under a sky, with Jamo flying alongside and writing a note by each
screen. It was option 04 of the review (2026-10-20) and is now the whole site. It speaks Russian,
Uzbek and English.

```sh
npm install
npm run dev     # :5191; /api/waitlist runs in Vite against DATABASE_URL from .env.local
npm run build   # static files in dist/
```

It replaced the coming-soon page here on 2026-10-22; the deployment, the Function and the Neon table
stayed as they were. The pages use hash routes, so `dist/` works from any static host with no SPA
fallback.

## The waitlist Function

The waitlist forms post `{ phone | email, source, locale }` to `POST /api/waitlist`, a Vercel Function
(`api/waitlist.ts`) that writes to Neon Postgres. Phones are stored as `+` and digits; nine digits
without a `+` count as an Uzbek number. It answers 204 for a new and a known contact alike, 400 for
one it turns away, 500 if the database fails.

Each row holds a phone or an email. The function brings an older email-only table to that shape on
its first signup after a deploy: it adds the `phone` column and swaps the email primary key for
unique indexes, in one transaction, without rewriting or deleting rows.

Deploying on Vercel:

1. Import the repo; the Vite preset is detected (build `npm run build`, output `dist`), and
   `api/waitlist.ts` becomes a Function on its own.
2. Storage → Marketplace → **Neon** → connect it to the project. That sets `DATABASE_URL` for every
   environment. The table `waitlist_signups` is created on the first signup.
3. Firewall → add a rate-limit rule on `/api/waitlist` (say 10 requests per minute per IP); the
   Function itself does not limit callers.

Reading the list: Neon's SQL editor, or
`psql "$DATABASE_URL" -c "\copy (SELECT phone, email, locale, source, created_at FROM waitlist_signups ORDER BY created_at) TO 'waitlist.csv' CSV HEADER"`.

## The waitlist form

It asks for a phone number first; "Удобнее почта?" under it switches to an address and back.

- The country is a chip in front of the number: the flag and its code, Uzbekistan by default. It opens
  a list with the neighbours (UZ, KZ, KG, TJ, TM, RU) above every other country, and a search that
  takes a name, an ISO code or a calling code.
- The number is written in the country's groups as it is typed (`90 123 45 67`) for those six
  countries, whose formats are known; elsewhere it takes digits as they come and checks only length.
- A number pasted or autofilled with its `+` and code picks its own country. Under +7 the first digit
  decides: Kazakh numbers start with 6 or 7. A Russian or Kazakh number written with its home 8 loses it.
- `src/shared/phone.ts` holds the codes and formats; `src/landings/sky-jamo/phone.tsx` the field.

## Analytics

Google Analytics, property "MyJamo Web" (services@myjamo.com), stream "Landing", `G-GCX9L5TBDE`.
`src/shared/analytics.ts` loads it in built pages only, so `npm run dev` sends nothing. Hash routes
report as paths (`#/download` as `/download`); the stream's history-based page views are off, so
in-page anchors are not counted. A signup sends `generate_lead` with `method` (phone or email) and
`form` (hero or footer), never the contact itself.

## Routes

- `/` is the day.
- `#/download` is where the apps will be: the web version first, the desktop and mobile apps coming soon.
- `#/kit` is the app-UI kit's specimen, in `npm run dev` only.

## Where things are

- `src/landings/sky-jamo/` is the page: `Page.tsx` puts it together, `top.tsx` holds the first
  screen (the bar, the hero and its form, the footer), `sections.tsx` the rest of the day, `copy.ts` the words in all three languages, `notes.tsx` Jamo's notes, `download.tsx`
  the download page.
- `src/landings/sky/` is option 02, which the page is built on. It keeps the sky, its colours and
  the base styles (`sky.css`); `sky-jamo.css` adds to them.
- `src/shared/app-ui/` is a React copy of the web app's own components, and every product screen on
  the page is drawn with it. Its README lists each component and the frontend file it mirrors. When
  the app's design changes, update the kit and the page follows.

## Slow connections

- Until the script and styles are in, `index.html` shows Jamo thinking: its eyes gone to three dots,
  `think2` drawn in plain CSS. It fades in after 0.4 s, so a fast connection never sees it.
- Nothing holds up that first paint: the build links the stylesheet after the face (`vite.config.ts`)
  and the fonts load without blocking. `main.tsx` fades the face out once the page and its styles are in.
- The first screen comes with the page. The rest of the day, Jamo's notes and the download page each
  load as a chunk of their own right after, with the same thinking face in their place meanwhile.
  On DevTools' slow 3G the hero is up at about 3 s and the rest of the day a second later.

## Phones

Most visitors arrive on a phone, so the page is checked at 320–430 px wide as well as on desktop:

- The bar keeps the brand's name under its mark, small, and a short sign-up button ("Записаться") beside the clock. Tapping it puts the cursor
  in the nearest waitlist form, with the phone keypad up.
- What Jamo left on each screen (the card it made, the call, the toast) comes out from under the
  window at its real size, where the desktop page floats it over the window.
- At 18:40 the stage is drawn narrower: the browser, with the phone over its corner.
- Jamo sits in the corner and says each note in a bubble, and steps aside while the keyboard or the
  country list is up.
- On touch screens the frosted panes become plain tinted glass, because re-blurring the moving sky
  behind each pane is what makes a phone stutter. Only the bar keeps its blur.
