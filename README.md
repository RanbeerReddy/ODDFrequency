# ODD FREQUENCY // INDEPENDENT CLOTHING LABEL

> **"Clothes for the beautifully out of sync."**  
> An experimental fashion label for Indian Gen-Z exploring the friction between dark alternative grunge heavywear (**The Void**) and ironic niche internet culture (**The Feed**).

---

## ⚡ Concept & Validation Philosophy

Odd Frequency carries **zero inventory** and operates on a **demand-validation model**.

Instead of overproducing garments and generating deadstock, every silhouette is published as a design concept with indicative pricing in Indian Rupees (₹). Visitors vote on pieces they want manufactured, and only high-conviction concepts enter sample prototyping and small-batch production in India.

### Two Worlds, One Identity:

1. **THE VOID**
   - **Aesthetic**: Dark alternative, gothic, metal-inspired, grunge, underground heavywear.
   - **Palette**: Faded black, charcoal, graphite, deep burgundy accents.
   - **Specs**: 280–380 GSM combed French Terry cotton, hand-distressed raw hems, antique oxidized hardware, cyber-sigilism typography.

2. **THE FEED**
   - **Aesthetic**: Ironic graphic tees, baby tees, niche internet humor, absurd slogans, playful Gen-Z culture.
   - **Palette**: Natural bone/off-white, deep charcoal, electric acid-lime accents.
   - **Specs**: 190–250 GSM bio-washed cotton, contrast ringer trims, tailored 90s baby crops, glitch/dithered pixel prints.

---

## 🛠️ Tech Stack

- **Core**: React 19 + Vite
- **Styling**: Vanilla CSS with custom design tokens, responsive CSS Grid, and subtle film grain texture
- **Audio Experience**: Interactive Web Audio API synthesizer generating a low-resonance lo-fi ambient drone (zero 404s, royalty-free, no external network dependencies, paused/muted by default)
- **State & Persistence**: `localStorage` session persistence to prevent accidental repeated votes and store local waitlist registrations
- **Deployment**: Static site ready for GitHub Pages or Vercel

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn / pnpm

### 2. Installation
```bash
git clone https://github.com/RanbeerReddy/ODDFrequency.git
cd ODDFrequency
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized static build is emitted to `dist/`.

---

## 🎨 Customization Guide

### 1. Product Data
All design concepts are stored in:
- [`src/data/products.js`](file:///d:/pojects/clothing%20brand/src/data/products.js)

To add or modify garments, edit the `PRODUCTS` array with your design IDs (`OF-001`), names, indicative prices, categories, fit, and specs.

### 2. Community Drop Concepts
The 4 competing concepts in the "Help Us Make The Next Drop" arena are located in:
- [`src/data/concepts.js`](file:///d:/pojects/clothing%20brand/src/data/concepts.js)

### 3. Images and Mockups
All garment mockups and editorial lookbook assets are located in:
- `public/images/`

To replace any mockup, swap out the corresponding image file or update the file path in `src/data/products.js`.

### 4. Colors and Design Tokens
Brand colors, typography, and theme scopes are configured in:
- [`src/styles/index.css`](file:///d:/pojects/clothing%20brand/src/styles/index.css)

Key CSS variables:
- `--accent-burgundy`: `#94172b` (The Void accent)
- `--accent-lime`: `#d4ff00` (The Feed accent)
- `--bg-primary`: Deep charcoal/void black
- `--font-headline`: `'Syne'`
- `--font-sub`: `'Space Grotesk'`
- `--font-mono`: `'Space Mono'`

### 6. YouTube Sound Deck & Playlist Setup
The persistent sound dock at the bottom is powered by the YouTube IFrame API and supports:
- Curated genre channels: **The Void** (darkwave/grunge/post-punk), **The Feed** (hyperpop/breakcore), and **Subterranean Radio** (lo-fi tape beats).
- **Random song rolling** per genre via the 🎲 button or continuous shuffle mode.
- Single YouTube songs or entire YouTube playlists (`PL...` links).

To add songs or playlists:
1. **Via Code**: Open [`src/data/musicTracks.js`](file:///home/ranbeer/ODDFrequency/src/data/musicTracks.js) and add items to `DEFAULT_TRACKS` using any YouTube link or ID.
2. **Via Website UI**: Click the **TRACKS** button in the bottom dock, go to **[03] + ADD YOUTUBE SONG / PLAYLIST**, paste any YouTube link, and click Add. You can also click "Copy Code Snippet" to copy your added tracks straight into code!

---

## 📄 License & Ethos

Created as an independent concept prototype for Odd Frequency.  
*Clothes for the beautifully out of sync.*

