# 🎯 AIM MASTER — Target Shooting Challenge

A fast-paced, addictive, high-precision browser target shooting and aim training game built strictly with **HTML5 Canvas**, **CSS3 Modern Styles**, and **Vanilla JavaScript (ES6+)**. Zero dependencies, zero backends, zero external audio assets!

---

## ✨ Features

- 🎮 **3 Game Modes**: Easy (60s), Medium (45s), Hard (30s) with adaptive target movement and sizes.
- 🎯 **Dynamic Target Types**:
  - **Normal Target (+10 Pts)**: Standard dual-ring cyan target.
  - **Small Target (+20 Pts)**: Compact purple precision target for high accuracy.
  - **Bonus Target (+50 Pts)**: Golden star target with a short lifetime indicator.
  - **Bomb (-10 Pts & Combo Reset)**: Pulsing hazard target to avoid!
- 🔥 **Combo System**:
  - 3 Consecutive Hits → **1.2x Multiplier**
  - 5 Consecutive Hits → **1.5x Multiplier**
  - 10 Consecutive Hits → **2.0x Multiplier**
  - Misses reset your active combo streak!
- 🔊 **Procedural Web Audio Engine**: Synthesizes custom retro sound effects using the Web Audio API without relying on external `.mp3` or `.wav` files.
- 🏆 **Local Leaderboard & Statistics**: Automatically persists player name, high scores, accuracy percentage, total hits, best combo, and top 20 rankings per difficulty in browser `LocalStorage`.
- ⚡ **High Performance & Responsive**: High DPI Canvas scaling (`devicePixelRatio`), unified Pointer Events (`pointerdown`) for touch/mouse, and 60 FPS `requestAnimationFrame` loop.
- 🎨 **Modern Cyber Visual Design**: Dark/Light mode support, glowing visual accents, floating score popups (`+50 BONUS!`), particle explosions, and glassmorphism UI.

---

## 🛠️ Project Structure

```
aim-master/
├── index.html     # Semantic HTML5 layout, HUD, overlays & modals
├── style.css      # Cyber gaming CSS design, animations, & responsiveness
├── script.js      # Procedural sound, storage, particle engine & game loop
└── README.md      # Project documentation & deployment guide
```

---

## 🚀 How to Run Locally

Since AIM MASTER is a frontend-only project built with pure native Web APIs, no build tools or package managers are required!

### Option 1: Direct File Opening
Simply double click `index.html` or open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (VS Code / Python / Node)
For the best experience (e.g. testing touch events or local storage isolation):

Using Python:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

Using Node `npx`:
```bash
npx serve .
```

---

## 🌐 How to Deploy

### ⚡ Deploy to Vercel

1. Push your project directory to a GitHub/GitLab repository.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Select your repository.
4. Leave **Framework Preset** as **Other** / **Static Site**.
5. Click **Deploy**. Your site will be live instantly!

Alternatively, using Vercel CLI:
```bash
npm i -g vercel
vercel
```

---

### 🐙 Deploy to GitHub Pages

1. Push your project files to your GitHub repository.
2. Navigate to your repository **Settings** -> **Pages**.
3. Under **Source**, select `main` (or `master`) branch and `/ (root)` directory.
4. Click **Save**.
5. Your game will be live at `https://<your-username>.github.io/<repository-name>/`.

---

## 🕹️ Controls & Game Rules

- **Mouse / Touch**: Click or tap targets as fast as possible before they bounce away or expire.
- **P** or **ESC**: Pause / Resume active game round.
- **Spacebar / Enter**: Trigger default focused menu buttons.

---

## 🛡️ License

Created with ❤️ by the Google DeepMind Antigravity Team. Free to use, modify, and distribute!
