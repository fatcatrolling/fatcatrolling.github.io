# CLAUDE.md — Project context for future Claude sessions

This file primes any future Claude Code session on what this project is, who the user is, and how it works. Read this first before making changes.

---

## Project

**Fat Cat Rolling** — a static HTML/CSS/JS portfolio site for **Kim Nguyen**, an animator and technical artist targeting jobs in:

- Character animation (film/TV)
- Technical animation / rigging / pipeline TD
- VFX
- Real-time / Unreal / Unity
- AR / VR (Snap Lens Studio)

Credits: Robot Chicken, M.O.D.O.K., Snap Inc.

Tagline: **"The Hybrid Visionary"** — "how does this look? / how does this work?"

The site is modeled aesthetically on [spencergabor.work](https://spencergabor.work/) — minimal, image-first, light/clean, with a viewer-selectable color palette switcher.

---

## Tech stack

- **Vanilla HTML / CSS / JS.** No frameworks. No build step. No package.json.
- Hosted on **GitHub Pages** (free tier)
- Custom domain `fatcatrolling.com` via **Porkbun**
- No analytics, no cookies, no tracking
- All content edited by Kim through one file: **`data.js`**

---

## User profile

Kim is a **professional animator, not a developer**. She is comfortable with Photoshop, Premiere, Media Encoder, After Effects, Illustrator. She is **not** comfortable editing JS or HTML — every code change must go through Claude or another assistant. The site is intentionally structured so the only "code" file she touches is `data.js`, and any syntax error there shows a visible banner instead of breaking the site.

Contact email: `hello@fatcatrolling.com` (professional; personal gmail kept private)

## Brand / design direction

- **3 palettes** — Warm (light cream/olive, default), Blue (dark navy), Purple (dark plum); `data-palette` values are `warm` / `blue` / `purple`
- **One bold typographic moment**: hero name in display-weight Inter
- **One interactive delight**: the corner palette switcher with bouncy click animation
- **One identity mark**: the Fat Cat mascot — large in the hero (top-right), plus a fixed corner button (**top-left**, "back to top") that appears once the hero mascot scrolls away
- 8-pt spacing grid, generous whitespace, WCAG AA contrast on every palette
- All motion is GPU-accelerated transforms only, respects `prefers-reduced-motion`

---

## File map

| File | Role |
| --- | --- |
| `index.html` | Home — **Technical Animation reel** is the hero. Used for games/real-time/TD applications. |
| `animation.html` | `/animation` — Character Animation reel. Used for film/TV character animator applications. |
| `vfx.html` | `/vfx` — VFX reel. Used for VFX studio applications. |
| `about.html` | `/about` — long bio, experience, credits. |
| `404.html` | Pretty-path SPA router (`/animation` → `animation.html` etc.) + sleeping-cat animation. |
| `styles.css` | All styling. Palette tokens at top. Motion keyframes at bottom. Shared by all pages. |
| `script.js` | Behavior — palette switcher, lightbox + focus trap, hero name cascade, scroll-in reveal, mascot easter egg, lazy reel embed (Vimeo + YouTube + placeholder), `data.js` error guard. |
| `data.js` | **Kim edits this.** All content (profile, reels, gallery, about) lives here in JS object form. Wrapped in `try/catch` so a syntax error doesn't white-screen the site. |
| `validate.html` | Local preflight checker — Kim opens it before pushing. Lints `data.js`, checks every gallery image, video, and poster exists, shows green/red. |
| `images/` | Reel posters (WEBP), OG preview cards (JPG), and the layered OrangeCat mascot parts in `OrangeCat_webp/`. |
| `videos/` | Gallery clips — `webm/` holds the looping videos, `webp/` holds their poster stills. |
| `favicon.ico` + `favicon.png` | Tab icon (cat). `.ico` is the universal fallback; `.png` the higher-res icon. No SVG favicon (it caused a tab-icon flicker). |
| `apple-touch-icon.png` | iOS home-screen icon (180×180 PNG). |
| `CNAME` | Contains `fatcatrolling.com` for GH Pages custom domain |
| `robots.txt` + `sitemap.xml` | Search crawler hygiene |
| `README.md` | Plain-English Kim-facing docs (editing, deploying, troubleshooting) |
| `DNS-SETUP.md` | Porkbun → GitHub Pages walkthrough |

---

## Key architectural decisions (and why)

### Multi-page, not query-param reordering
Each per-application URL is a **real page**, not a query-param trick. `/animation` and `/vfx` are separate HTML files. The home page leads with Technical Animation (her primary target). This gives cover-letter-grade URLs without server-side routing.

### Pretty paths via `404.html`
GitHub Pages is static — there's no server-side routing. The `404.html` page reads the path, redirects `/animation` → `animation.html`, etc. Standard GH Pages SPA trick.

### `data.js` instead of `data.json`
JSON would be marginally simpler syntax, but JS lets us include a `try/catch` so a syntax error doesn't kill the page. Kim sees a banner instead of a blank site.

### No analytics
Skipped per user. Adding GoatCounter later is one script tag — see plan file for details.

### Vimeo + YouTube support per-reel
Each reel in `data.js` declares `provider: "vimeo" | "youtube" | "placeholder"`. Industry default is Vimeo for animation reels (cleaner, no ads); YouTube is the secondary option.

### Sketchfab + Lens-QR gallery item types (deferred)
Mentioned in plan but not implemented in initial build. `data.js` schema can extend `gallery[].type` to support `"sketchfab"` and `"lens"` later.

---

## How Kim updates content

She edits `data.js`. The structure mirrors the page sections:

```js
window.SITE_DATA = {
  profile: { name, brand, tagline, roles, location, email, socials, credits },
  reels:   { tech, animation, vfx },     // 3 reels, one per page
  gallery: { home, animation, vfx },     // gallery items per page
  about:   { shortBio, longBio, experience, clients },
  pages:   { home, animation, vfx, about, footer }  // all user-visible headings + copy
};
```

Each gallery item: `{ type, src, poster, title, alt }` — `type` is `"image"` or `"video"`; `poster` is the still shown for video items
Each reel: `{ title, provider, id, poster, duration, year, description, shotlist[] }`
Each shotlist entry: `{ time, project, role }`
Each credit: `{ name, url }` — rendered as a linked company name in the credits strip
Each pages.{page}: key/value pairs for headings, taglines, descriptions on that page

After editing, she opens `validate.html` in her browser (double-click the file) to confirm everything parses and all images exist.

---

## Motion craft details (the part that makes this site feel like Kim's)

- **Hero name** cascades in letter-by-letter with spring overshoot — on every page load
- **Mascot** breathes idly, blinks on a timer, turns its head toward the cursor, opens its mouth on hover
- **Mascot easter egg**: 3 fast clicks on either mascot → a wobble bounce
- **Palette swatches** spring-bounce on click; active swatch has gentle idle pulse
- **Gallery tiles** scale + tilt 1° on hover with spring easing, caption slides up
- **Scroll-in stagger**: tiles fade up with 60ms stagger via IntersectionObserver
- **Lightbox**: FLIP-style scale transform from the clicked thumbnail
- **404 page**: sleeping cat with breath cycle + "Zzz" particles

All wrapped in `@media (prefers-reduced-motion: reduce)` overrides that strip animations to instant transitions.

---

## Security note (from Brief)

- Never expose visa/immigration status anywhere on the site or in resume copy
- Strip PII (phone, home address) from any resume copy before publishing
- The site itself currently displays only: name, professional email, professional socials, work samples

---

## Where the plan lives

The full design plan is at:
`C:\Users\FatCatRolling\.claude\plans\please-read-the-brieft-txt-zazzy-cascade.md`

It has the deeper rationale for every decision — referenced research on recruiter expectations, asset spec sheets, performance budgets, browser support targets, etc.

---

## Open TODOs (waiting on Kim)

- [ ] Vimeo Basic account signup if using Vimeo
- [ ] Set up `hello@fatcatrolling.com` inbox — Zoho Mail Free recommended (free send-as + receive, ~15 min setup via Porkbun DNS MX records)

## Recently completed

- Initial site build (all pages, palette switcher, lightbox, motion, validator)
- Revision 2: removed GitHub, changed email to hello@fatcatrolling.com, mascot moved to top-left, credits strip now lists companies as links, .gitignore added
- Revision 3: removed More/Other Reels sections, fixed footer Home link, removed arrows from About Elsewhere, added hero--sub classes for subpage headings, all user-visible copy now editable from data.js pages block
- Revision 4: real assets in place (layered OrangeCat mascot, reel posters, gallery videos, real Vimeo reel IDs, real bio/experience copy). Review pass: fixed favicon flicker (dropped SVG favicon for `.ico`+`.png`), real JPG OG cards, `validate.html` now checks videos, prerender set to `moderate`, gallery videos `preload="none"`, unused assets removed, lightbox media background made transparent.
