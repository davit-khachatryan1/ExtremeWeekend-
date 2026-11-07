# Weekend Extreme — website

Immersive single-page site for **Weekend Extreme**, off-road jeep expeditions from Koti (Tavush) to the alpine camp in Lori.

- **3D hero**: real-time low-poly mountains, forests, wind-blown grass, fog and clouds. A convoy of UAZ-style jeeps drives the glowing route Koti → Camp **as you scroll**, with a live HUD (checkpoint, time on the road, altitude).
- **Day → night** in the Camp section: the sun sets, then stars, the Milky Way, the moon and a flickering campfire with sparks.
- Schematic **topographic route map** generated from the same terrain, with clickable checkpoints.
- Itinerary timeline (2 / 3 days), Quest section with 3D flip riddle cards, packages, **price calculator** (total + 30% deposit), packing checklist, departures calendar with seats left, FAQ, booking form → Telegram.
- **Languages**: Հայերեն (default, `/`), English (`/en/`), Русский (`/ru/`), each with its own SEO tags.
- Effects: Lenis smooth scroll, GSAP ScrollTrigger, split-text reveals, magnetic buttons, mud-splash on CTA hover, compass cursor (desktop), animated counters, horizontal-scroll gallery.
- **Sound** (off by default, speaker button in the header or "Engine sound" on the driving panel): wind everywhere; jeep engines that rev with the drive; real recorded birdsong at the top of the site and in the camp by day; campfire crackle and an owl at night in the camp.
- **Performance / accessibility**: the 3D scene is a separate lazy-loaded chunk; phones get a lighter scene; `prefers-reduced-motion`, no-WebGL and very weak devices get an illustrated parallax fallback (or your own looping video). Loading screen = a mountain road with a jeep.

Stack: React 19 + Vite + TypeScript, Three.js via React Three Fiber + drei, GSAP + ScrollTrigger, Lenis, Tailwind CSS v4.

---

## 1. Run locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173 (English: `/en/`, Russian: `/ru/`).

Other commands:

```bash
npm run build      # production build into dist/ (also writes /en/, /ru/, sitemap.xml, robots.txt)
```

```bash
npm run preview    # serve the production build at http://localhost:4173
```

```bash
npm run typecheck  # TypeScript check
```

```bash
npm run og         # re-render public/og-image.png from scripts/og-image.html (needs Google Chrome)
```

Testing the different visual modes: add `?quality=high`, `?quality=low` (phone-level 3D) or `?quality=off` (no 3D fallback) to the URL.

---

## 2. Edit texts, prices, dates — one file

**Everything editable lives in [`src/config/content.ts`](src/config/content.ts):**

| What | Where in the file |
|---|---|
| Phone, email, Telegram, Instagram, Facebook, TikTok, site URL | `SITE.contacts`, `SITE.siteUrl` |
| Deposit %, free-cancellation days, payment link & methods | `SITE.booking` |
| Quest discount % | `SITE.questDiscountPercent` |
| Animated counters (km, altitude, …) | `NUMBERS` |
| Packages & prices (`null` = "price on request") | `PACKAGES` |
| Add-ons (tent rental, horse riding, drone) | `ADDONS` |
| Season months, seats per departure, booked seats, skipped dates | `SEASON` |
| Route checkpoints (name, text, altitude, photo) | `CHECKPOINTS` |
| Gallery photos / clips | `GALLERY` |
| Real reviews | `REVIEWS` |
| Every text of every section in hy / en / ru | `T` |

Each text looks like `{ hy: '…', en: '…', ru: '…' }` — change all three.

**Departures calendar**: every Saturday from May to October is generated automatically. When people book, update `SEASON.seatsTaken`, e.g. `'2027-05-08': 6` → that weekend shows "10 seats left" (capacity 16). Put holidays / no-tour Saturdays in `SEASON.skipDates`.

**Photos & videos**: drop files into `public/` (e.g. `public/gallery/mud.jpg`) and set `image: '/gallery/mud.jpg'` (or `video: '/gallery/mud.mp4'`, muted loop) in `GALLERY` / `CHECKPOINTS`. Until then, illustrated placeholders are shown. Use compressed JPG/WebP (~200 KB, 1600 px wide) and short MP4 clips (H.264, < 3 MB).

**Sounds**: drop real recordings into `src/assets/sounds/` — see [Natural sounds](#natural-sounds) below.

**Fallback video for weak phones**: set `SITE.heroVideo: '/media/hero.mp4'` (+ `heroVideoPoster`).

**Real 3D jeep model**: the jeep is built in code (no download). To use a GLB instead, put it in `public/models/` (Draco/KTX2-compressed is supported by drei's loader), make it face +Z, sit on y = 0 and be ~2.2 units long, and set `SITE.jeepModelUrl: '/models/uaz.glb'`.

---

## Natural sounds

The sound switch (header speaker, or "Engine sound" on the driving panel) plays: wind, the jeep engines while the convoy drives, birds at the top of the site and in the camp by day, campfire and an owl at night. **Every sound can be a real recording.** Put files into `src/assets/sounds/` with these names — the site finds them automatically, no code changes. Anything missing keeps the built-in generated sound.

| File | What the recording should be | Length |
|---|---|---|
| `uaz-idle.mp3` | **UAZ-469 idling**, microphone outside the car, steady, no voices | 10–30 s |
| `uaz-drive.mp3` | **UAZ-469 driving at a steady medium speed**, outside, no gear changes or braking | 15–40 s |
| `uaz-start.mp3` *(optional)* | UAZ engine starting — plays once when the drive begins | 2–5 s |
| `gravel.mp3` *(optional)* | tyres rolling on gravel / mud, as little engine as possible | 10–30 s |
| `birds/*.mp3` | **clear songs of single birds**, close, little background noise — one bird per file, any file names, 4–10 files | 2–10 s each |
| `birds-ambience.mp3` | soft background of many birds far away (currently: "Forest #3", CC0) | 1–3 min |
| `owl.mp3` *(optional)* | one owl call (tawny owl) for the camp at night | 2–6 s |

How they are used: the idle and drive loops are blended and pitched up as the jeeps speed up, so the engine revs with your scrolling; loops are joined with an automatic crossfade, so they don't need to be perfect loops. Bird songs play one at a time, from left or right, every few seconds, over the soft ambience. Files are downloaded only after a visitor turns sound on.

**Format**: MP3 (or M4A/AAC), 128–192 kbps. Avoid OGG (not supported in Safari). Trim silence at the start/end (free tool: [Audacity](https://www.audacityteam.org)). In `npm run dev` new files are picked up immediately; for the live site, rebuild and redeploy.

**Birds that sing in the forests and meadows of Tavush & Lori** (good choices for `birds/`): common blackbird, common chaffinch, European robin, great tit, song thrush, nightingale, Eurasian wren, common cuckoo, Eurasian skylark (meadows near the camp); tawny owl for `owl.mp3`.

**Where to get recordings**
- **UAZ-469**: licensed sound libraries, e.g. [A Sound Effect — UAZ 469](https://www.asoundeffect.com/sound-library/uaz-469) or the UAZ-469 clips on [Soundstripe](https://www.soundstripe.com/library/sound-effects/9844). Or record your own UAZ at Koti — the most authentic option (a phone held 2–3 m from the exhaust in calm weather works; a small recorder with a windscreen is better).
- **Birds**: [xeno-canto](https://xeno-canto.org) has recordings by species, many from Armenia — use **only files licensed CC BY** (most are "NC" = non-commercial, not allowed for a business site) and credit them; [Freesound](https://freesound.org) with the CC0 filter; [BigSoundBank](https://bigsoundbank.com) (CC0); or record at the camp at dawn.
- **Not allowed**: audio downloaded from YouTube videos.

**Credits**: for every recording whose licence asks for credit (e.g. CC BY), add a line to `SOUND_CREDITS` in `src/config/content.ts` (shown in small print in the footer) and to `src/assets/sounds/CREDITS.txt`.

---

## 3. Booking → your Telegram

The form POSTs to `/api/booking`. The included serverless function ([`server/booking-core.js`](server/booking-core.js), used by [`api/booking.js`](api/booking.js) on Vercel and [`netlify/functions/booking.mjs`](netlify/functions/booking.mjs) on Netlify) sends each request to your Telegram.

1. In Telegram, open **@BotFather** → `/newbot` → copy the **bot token**.
2. Send any message to your new bot (or add it to a group).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `"chat":{"id": …}` — that is your **chat id**.
4. In Vercel / Netlify → Project settings → Environment variables, add:
   - `TELEGRAM_BOT_TOKEN` = the token
   - `TELEGRAM_CHAT_ID` = the chat id
5. Redeploy.

If the endpoint is missing or fails (e.g. during `npm run dev`), the site copies the booking text and offers the Telegram / phone buttons instead, so no request is lost.

**Online 30% deposit**: create a payment page/link with your bank (vPOS), Idram or TelCell and put it in `SITE.booking.paymentUrl`. The "Pay the deposit" button then appears in the booking section and after a request is sent. Until then the site says the payment link will be sent after confirmation.

---

## 4. Deploy

### Vercel (recommended)

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo. The settings come from [`vercel.json`](vercel.json) (Vite, `npm run build`, output `dist`).
3. Add the Telegram environment variables (section 3) and deploy.
4. Add your domain in **Settings → Domains**, then set `SITE.siteUrl` to it and redeploy (used for canonical/hreflang/sitemap/OG links).

Or from the terminal:

```bash
npx vercel --prod
```

### Netlify

1. On [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → pick the repo. [`netlify.toml`](netlify.toml) already sets the build command, `dist` folder, the function and the `/api/booking` redirect.
2. Add the Telegram environment variables and deploy.

Or from the terminal:

```bash
npx netlify deploy --prod
```

---

## 5. Project structure

```
src/
  config/content.ts   ← ALL texts, prices, contacts, dates (edit this)
  config/seo.ts       ← titles/meta/Open Graph/hreflang + schema.org TouristTrip (AMD prices)
  three/              ← 3D scene: world.ts (terrain + route math, shared with the 2D map),
                        Terrain, Route, Jeep, Camp, Sky, CameraRig, env (day→night palette)
  sections/           ← one file per page section (Hero, Route map, Itinerary, Quest, Camp, …)
  components/         ← Header, Loader, Cursor, Icon, Media placeholders, motion helpers,
                        StaticScene (no-3D fallback), StickyBook (mobile bar)
  lib/                ← i18n, smooth scroll, scroll state, booking state & departures, audio
api/booking.js        ← Vercel function → Telegram
netlify/functions/    ← Netlify function → Telegram
server/booking-core.js← shared validation + message
scripts/og-image.html ← source of public/og-image.png
vite.config.ts        ← writes localized /en/ and /ru/ pages, sitemap.xml, robots.txt at build
```

Performance notes (Lighthouse, mobile: ~87–89 performance, 100 accessibility / best practices / SEO; desktop ~93):
- The branded loading screen is plain HTML in `index.html`, so it paints before any JavaScript runs.
- **Phones** don't wait for the 3D: the loader ends once the fonts are in, the illustrated landscape shows first, and the 3D is built on the visitor's first touch/scroll (or after 5 s), then fades in. **Desktop** builds the 3D behind the loader.
- The 3D world is built in stages (a few objects per frame), renders only while the hero or camp is on screen, and phones get fewer trees/grass and a lower pixel ratio; quality also drops automatically if the frame rate falls.
- Everything below the hero is a separate file (`src/sections/BelowFold.tsx`) that loads right after the first screen and adds its sections a couple at a time while the browser is idle; the route map's elevation bands are computed only when the map gets near the screen.
- All 3D content is generated in code, so there are no textures or models to download.

---

## 6. Placeholders still to fill

Find them in code with:

```bash
grep -n "@placeholder" src/config/content.ts
```

| # | Placeholder | Current value on the site | Where |
|---|---|---|---|
| 1 | Domain | `https://weekendextreme.am` | `SITE.siteUrl` |
| 2 | Phone (shown + `tel:` link) | `+374 00 00 00 00` | `SITE.contacts.phoneDisplay`, `phoneHref` |
| 3 | Email | `hello@weekendextreme.am` | `SITE.contacts.email` |
| 4 | Telegram username | `USERNAME` → `t.me/USERNAME` | `SITE.contacts.telegram` |
| 5 | Instagram / Facebook / TikTok | "coming soon" | `SITE.contacts.instagram`, `facebook`, `tiktok` |
| 6 | Online deposit payment link | none ("we'll send the link") | `SITE.booking.paymentUrl` |
| 7 | Accepted payment methods | Card · Idram · TelCell · bank transfer | `SITE.booking.paymentMethods` |
| 8 | Quest winners' discount | 10% | `SITE.questDiscountPercent` |
| 9 | Off-road distance | ~40 km | `NUMBERS[0]` |
| 10 | Altitude | 2 200 m | `NUMBERS[1]` |
| 11 | Number of checkpoints | 6 | `NUMBERS[2]` (+ `CHECKPOINTS`) |
| 12 | 3-day Expedition price | "Price on request" | `PACKAGES` → `3day.price` |
| 13 | Corporate price | "Price on request" | `PACKAGES` → `corporate.price` |
| 14 | Tbilisi Edition price | "Price on request" | `PACKAGES` → `tbilisi.price` |
| 15 | Drone video: per person or per group | 2 000 AMD per person | `ADDONS` → `drone.unit` |
| 16 | Transfer time Tbilisi → Koti | ~2 h | `T.route.options` (tbilisi) |
| 17 | Return road (same or different road) | neutral "over the mountains" | `T.route.returnText` |
| 18 | Meeting point in Yerevan | "sent after booking" | `T.itinerary.day1[0]`, `T.route.options` (minivan) |
| 19 | 3-day program (extra camp day) | sunrise, long hike, horses, extra Quest stage, campfire | `T.itinerary.dayExtra` |
| 20 | Season League grand-final month | October | `SEASON.finalMonth` |
| 21 | Checkpoint altitudes & stories (incl. the river crossing) | 900 / 1 250 / 1 500 / 2 100 / 2 150 / 2 200 m | `CHECKPOINTS` |
| 22 | Mobile signal at the camp | "weak or missing in places" | `T.faq.items` (mobile signal) |
| 23 | When the remaining 70% is paid | "on the tour day" | `T.packages.rest`, FAQ "How do I pay?" |
| 24 | Seats per departure / booked seats | 16 / none booked | `SEASON.capacity`, `SEASON.seatsTaken` |
| 25 | Photos for checkpoints & gallery, short clips | illustrated placeholders | `CHECKPOINTS[].image`, `GALLERY[]` |
| 26 | Hero fallback video for weak phones (optional) | illustrated fallback | `SITE.heroVideo` |
| 27 | Real reviews | "coming soon" cards | `REVIEWS` |
| 28 | Telegram bot for bookings | not configured → copy + open Telegram | env vars `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| 29 | Share image | generated illustration | `public/og-image.png` (1200×630, can be replaced with a real photo) |
| 30 | Real UAZ engine recordings | generated engine sound | `src/assets/sounds/uaz-idle.mp3`, `uaz-drive.mp3` (+ optional `uaz-start.mp3`, `gravel.mp3`) — see Natural sounds |
| 31 | Clear bird songs | soft "Forest #3" ambience only | `src/assets/sounds/birds/*.mp3` (+ optional `owl.mp3`); credits in `SOUND_CREDITS` |

Also worth knowing:

- The Quest **points table** shows example teams and is labelled "example".
- The route map is **schematic**: it is generated from the stylized 3D landscape, not real topography. The real camp location link is `SITE.campMapUrl`.
