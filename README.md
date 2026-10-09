# Maati POS

Browser till for the Noida and Delhi shops. Cash only in v1.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Opens on [http://localhost:5175](http://localhost:5175). After `npm run seed` in the backend (same accounts on the hosted demo DB):

1. Unlock till `NOIDA T1` / `1234` or `DELHI T1` / `1234`.
2. Sign on Noida `1001` / `1111`, Delhi `1002` / `1111`, or manager `2001` / `1111`.
3. Optional scan: `8901234000011` (Noida Palak).

Full demo table: [root README](../README.md).

```bash
npm run build:demo     # demo / portfolio API
npm run build          # production API
```

Vercel hosts this app. The API stays on Render. See [DEPLOY.md](../DEPLOY.md).
