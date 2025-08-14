# Ravchamo — MVP

Mobile-first dummy frontend to test the flow for a food recommender in Tbilisi (Vake / Saburtalo).

## Quick start (local)
1. Install Node 18+.
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy on Vercel (no coding)
- Create a GitHub repo and upload these files.
- In Vercel, **New Project → Import** the repo → Framework detected: Next.js → **Deploy**.
- Add your domain in **Settings → Domains**.

## Where to edit
- Dummy data: `data/dishes.json`
- Strings/UI text: `app/ui/strings.js`
- Scoring logic: `lib/recommend.js`
- Styles: `app/globals.css`

## Notes
- Geolocation is used only in the browser; not stored.
- Opening hours format: `{ mon:[10,22], ... }` in 24h.
- This is a frontend-only MVP. No database yet.
