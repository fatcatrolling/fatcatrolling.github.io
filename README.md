# Fat Cat Rolling — Kim Nguyen Portfolio Site

A static, hand-built portfolio site. No build step. No framework. No tracking.
Just HTML, CSS, JS, and one editable file: **`data.js`**.

---

## What you'll do most often: edit `data.js`

Open `data.js` in any text editor (VS Code, Sublime, even Notepad). Everything you'd ever want to change is in one file:

- Your name, email, location, social links
- The 3 reel embed URLs (Vimeo or YouTube)
- Gallery items per page (image, title, year, discipline tag)
- About-page bio, experience, credits

**Always run `validate.html` before pushing.** Double-click `validate.html` in File Explorer — it opens in your browser and shows a green/red checklist. If anything is red, fix it before pushing or your site will break.

### `data.js` syntax rules (the only ones that matter)

1. Every line inside `[ ]` or `{ }` needs a **comma at the end**, except the last one
2. Wrap any text in `"double quotes"` — if your text has an apostrophe, use double quotes
3. Filenames must be **lowercase**, **hyphens only**, **no spaces**

---

## Asset spec sheet (when you replace the placeholders)

Drop new files into `images/` with lowercase, hyphenated names, then update the filename in `data.js`. Export from Photoshop / Premiere with these settings:

### Stills (gallery tiles)
- **1600 px on the long edge** · WebP quality 80–85 · sRGB · 3:2 or 1:1 framing
- File → Export As → WebP

### Reel poster frames (`poster-tech.webp`, `poster-animation.webp`, `poster-vfx.webp`)
- **2400 × 1350 px** (16:9 retina) · WebP quality 85
- Pick the single strongest frame from your reel · high contrast · no text overlay

### Looping clips (replacing GIFs in galleries)
- Export both: **MP4 (H.264)** + **WebM (VP9)** — browser picks the best
- 1280 × 720 for tile loops, 1920 × 1080 for hero clips · 2–4 Mbps · **muted, no audio track**
- 4–8 sec seamless loop · Premiere preset: H.264 → "Match Source – Adaptive High Bitrate"

### OG / social preview images
- One per page: `og-home.jpg`, `og-animation.jpg`, `og-vfx.jpg`, `og-about.jpg`
- **1200 × 630 px** · JPG quality 82 (~80–150 KB each)
- Discipline-appropriate still + subtle name wordmark bottom-left

### Favicon + mascot
- `favicon.ico` — multi-size icon (16 + 32 px), the universal browser tab icon
- `favicon.png` — 64 × 64 PNG, the higher-resolution tab icon
- `apple-touch-icon.png` — **180 × 180 px**, PNG-24, sRGB (iOS home screen)
- The OrangeCat mascot is a stack of WEBP layers in `images/OrangeCat_webp/` — referenced by the `.cat` block in each HTML page
- Note: no SVG favicon — an SVG tab icon caused a flicker to the generic globe, so the site uses `.ico` + `.png` only

---

## Sending different links to different studios

Each role has a real, cover-letter-grade URL:

| Application context | URL |
| --- | --- |
| Games / real-time / TD studios | `fatcatrolling.com/` |
| Film / TV character animator | `fatcatrolling.com/animation` |
| VFX studios | `fatcatrolling.com/vfx` |
| Cover-letter "about me" link | `fatcatrolling.com/about` |

Paste the matching URL into each application. No tracking — recruiters see clean, professional URLs.

---

## Going live: one-time GitHub Pages setup

### 1. Install Git for Windows

Download from [git-scm.com](https://git-scm.com/download/win) and run the installer with default options.

### 2. Initialize the project as a Git repo

Open PowerShell in the project folder (Shift + right-click → "Open PowerShell window here") and run:

```powershell
git init
git add .
git commit -m "Initial portfolio site"
```

### 3. Create the GitHub repo

1. Go to <https://github.com/new>
2. Repo name: `fatcatrolling.github.io` (this exact name is recommended — it gives you a free `fatcatrolling.github.io` URL automatically)
3. **Public** · No template, no README, no .gitignore (you already have files)
4. Click "Create repository"

GitHub will show you a command block. Copy the `git remote add origin ...` line and run it in PowerShell:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/fatcatrolling.github.io.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. On your repo page, click **Settings** (top right)
2. Click **Pages** (left sidebar)
3. Under "Source", choose **Deploy from a branch** · Branch: `main` · Folder: `/ (root)` · Save
4. Wait 1–2 minutes — the site is live at `https://YOUR-USERNAME.github.io/`

### 5. Hook up the custom domain (`fatcatrolling.com`)

Follow [`DNS-SETUP.md`](DNS-SETUP.md) for the Porkbun-side steps.

On the GitHub side:

1. Settings → Pages → Custom domain → enter `fatcatrolling.com` → Save
2. Wait for the DNS check to pass (can take up to 24h, usually 1–10 min)
3. Tick the "Enforce HTTPS" box once it becomes available

The `CNAME` file in this repo already contains `fatcatrolling.com`, so this should just work.

---

## Updating the site (every time after the initial setup)

After you've changed `data.js` or dropped new images:

```powershell
# 1. Preflight check — open validate.html in your browser, make sure it's all green

# 2. Stage your changes
git add .

# 3. Commit with a short message
git commit -m "Add new gallery items"

# 4. Push to GitHub
git push
```

Your live site updates in about 1 minute.

---

## Files in this project

| File | What it does |
| --- | --- |
| `index.html` | Home page (Technical Animation reel + mixed gallery) |
| `animation.html` | Character Animation reel page |
| `vfx.html` | VFX reel page |
| `about.html` | About / longer bio |
| `404.html` | "Taking a nap" page + pretty-path router |
| `styles.css` | All styling — shared by every page |
| `script.js` | Behavior (palette, lightbox, motion, etc.) |
| **`data.js`** | **You edit this one** |
| `validate.html` | Preflight checker — **open this before every push** |
| `images/` | All gallery, poster, and OG image files |
| `favicon.ico` + `favicon.png` | Browser tab icon |
| `apple-touch-icon.png` | iOS home-screen icon (180 × 180 PNG) |
| `videos/` | Gallery clips (`webm/`) and their poster stills (`webp/`) |
| `CNAME` | Your custom domain |
| `robots.txt` | Tells search engines to crawl everything |
| `sitemap.xml` | List of pages for search engines |
| `README.md` | This file |
| `DNS-SETUP.md` | Porkbun → GitHub Pages walkthrough |
| `CLAUDE.md` | Context for future Claude sessions |

---

## Troubleshooting

**My site went white / blank after I edited `data.js`.**
You probably have a missing comma or unclosed quote. Open `validate.html` — it'll tell you the line. You can also click "Sources" in browser DevTools (F12) and view the data.js error.

**I uploaded an image but it doesn't show.**
Check the filename is **lowercase** with **no spaces**. Your computer is case-insensitive but GitHub Pages is not. `Hot-Chocolate.WEBP` ≠ `hot-chocolate.webp`.

**The palette switcher doesn't show up.**
Check the browser console (F12). Most likely `data.js` failed to load — see above.

**My pretty URLs (`/animation`, `/vfx`) work locally but 404 on the live site.**
GitHub Pages needs the `404.html` to be in the root of the repo (it is, by default in this setup). If you reorganized files into a subfolder, move `404.html` back to the root.

**I want to add a new palette color.**
Open `styles.css` and find the section starting with `:root[data-palette="warm"]`. Copy that block, change `warm` to your new name, change the colors, save. Then open each HTML file and add a new `<button class="palette__swatch palette__swatch--YOURNAME" data-palette="YOURNAME">` inside the `.palette` div.

---

## Questions / changes

Hand it back to your AI coding assistant and ask. The plan file (`CLAUDE.md`) has all the context any future session needs.
