# Loudy × Toutou — Our Little Universe

A romantic React/Vite website dedicated to Loudy from Toutou, with a MySQL + Express
backend and eight little mini-games.

## Run (frontend only, no database needed)
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm run dev` and open the printed local URL.

Everything works without the database — the games and the site just won't
persist memories, wishes, or messages between visits.

## Run with the full backend + MySQL
1. Install MySQL and make sure it's running.
2. Run `database.sql` against your MySQL server (creates the `loudy_toutou`
   database and all tables, including the new game tables).
3. Copy `.env.example` to `.env` and set your MySQL credentials.
4. Run `npm install`.
5. Run `npm run build` (builds the frontend into `dist/`).
6. Run `npm start` (starts the Express server on `PORT`, default 3000, and
   serves the built frontend + the `/api` routes).

While developing, you can also run `npm run dev` (frontend on Vite, port 5173)
in one terminal and `npm start` (API server, port 3000) in another — the Vite
dev server proxies `/api` requests to port 3000 automatically.

## What was fixed
- Added the missing `vite.config.js` (the React plugin was never wired up).
- Added the missing `tsconfig.json`.
- Fixed `package.json`: build tools now live in `devDependencies`, added the
  missing `@types/react`, `@types/react-dom`, and `@types/node` packages.
- Fixed a couple of loosely-typed pieces of state in `main.tsx` that could
  break a strict TypeScript build.
- Fixed duplicate/out-of-order section numbers in the UI (two sections were
  both labeled "06").
- This README previously described a WhatsApp Cloud API integration that
  didn't match the code — the "Tell Toutou Anything" form actually sent
  through EmailJS. It has since been switched to a real WhatsApp integration
  (see below) that sends straight to Toutou's phone.

## WhatsApp message zone 💬
The "Tell Toutou Anything" section (`#message`) sends Loudy's message
straight to Toutou's WhatsApp — no API keys, no backend, no setup required.

It works with a `wa.me` deep link: when Loudy taps "Send to Toutou", it
opens WhatsApp (app or web) with the message already typed out, addressed
to your number. Loudy just taps send inside WhatsApp and it lands directly
in your chat.

The destination number is set in `src/main.tsx`:
```ts
const WHATSAPP_NUMBER = "21623897700"; // digits only, country code, no + or leading 0
```
Change this constant to update where messages go. It currently points to
**+216 23 897 700**.

Note: this requires the visitor to have WhatsApp installed (or access to
WhatsApp Web) and to manually confirm the send inside WhatsApp — this is a
deliberate trade-off for a zero-config, always-working solution. If you
later want messages to send automatically without that confirmation tap,
that requires the Meta WhatsApp Cloud API (a Meta Business account, a
permanent access token, and a verified phone number ID), which is a much
heavier setup — let me know if you'd like that wired in instead.

## Personalize
Edit `src/data.ts` to change:
- names
- next date/countdown
- timeline
- memories
- date ideas
- inside jokes
- reasons

Replace the photo placeholders in `src/main.tsx` with your real images when ready.

The music button is intentionally a UI placeholder and does not autoplay audio.

## The mini-games 🎮
A new **Games** section (`src/games/`) adds eight little games, each in its
own component, all wired into the "Games" nav link:

1. **Catch My Hearts 💗** — move a basket to catch falling hearts. Gold
   hearts are bonus points, broken hearts cost you points. Ends once you've
   caught 25 hearts.
2. **Save Loudy's Heart 🛡️** — dodge falling rain while collecting stars;
   difficulty ramps up over three levels.
3. **The 60-Second Date ⏱️** — complete as many quick romantic actions as
   you can in 60 seconds (pick a flower, catch a heart, choose a gift,
   answer a question, find a hidden star).
4. **Build Our Dream Room 🏡** — drag and drop furniture into a room; saving
   the room stores the layout as JSON in the `dream_rooms` MySQL table.
5. **Star Collector: Make a Wish ⭐** — tap stars in a night sky, then write
   and save a real wish. Wishes are stored in the `wishes` MySQL table.
6. **Find the Hidden Kiss 💋** — find the hidden 💋 across 5 rounds before
   time runs out, with easy/hard modes and occasional bonus kisses.
7. **The Surprise Box 🎁** — complete five quick mini-challenges to unlock
   a Golden Box with a final surprise message.
8. **Our Little Adventure 🗺️** — a short four-stage adventure (find the
   flower → cross the bridge → collect the stars → open the love letter)
   that ends with a real message.

Every game that finishes also (best-effort) logs a short result to the new
`game_scores` table so you can see play activity in the database — this
never blocks or breaks the game if the API/DB isn't running.

## MySQL setup
1. Install MySQL.
2. Run `database.sql` (creates all tables: `memories`, `love_letters`,
   `bucket_items`, `reasons`, `daily_messages`, `quiz_questions`,
   `quiz_results`, `calendar_events`, `interactions`, and the new
   `game_scores`, `wishes`, `dream_rooms`).
3. Copy `.env.example` to `.env` and set credentials.
4. Run `npm install`, `npm run build`, then `npm start`.
