# Coming soon

The pre-launch page: Claude Design "Coming Soon v2.dc.html" (project
`a3c46b2d-ce89-4dfe-9f7d-2387ee5f0636`), built 1:1 with Vite + React. `src/JamoFace.tsx` is the
design's typed port of `dots/src/components/JamoFace.tsx`, cut down to the moods the page uses.

The one addition to the design: the form posts to the backend's `POST /api/v1/waitlist`
(`source: "hero"`, `locale` = the page language), and a refusal shows the server's detail.

```sh
npm install
npm run dev      # :5191, /api proxied to JAMO_API (default http://localhost:8080)
npm run build    # static files in dist/
```

`VITE_API_BASE` points the form at another origin at build time; by default it posts to the
page's own `/api`, so serve `dist/` behind the same Caddy site as the backend (or allow the
page's origin in CORS). `?lang=en` opens the page in English; Russian is the default.
