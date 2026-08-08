# Zama TV - د افغانستان تلویزیونونه 📺🇦🇫

A modern, responsive, high-performance Afghan Television and Radio streaming web application built with **React**, **Vite**, and **Tailwind CSS**.

![Zama TV Preview](https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **📺 Afghan Live TV Channels**: RTA Pashto, RTA Dari, Tolo TV, Lemar TV, Ariana TV, Shamshad TV, Solh TV, Tamaddon TV, Zhwandoon TV, and more.
- **📻 Afghan Radio Live Streams**: RTA Radio, Killid Radio, Spogmai Radio, Arman FM, Ariana FM, Arakozia FM, and more.
- **🏷️ Multi-Category Filtering**:
  - 🗞️ News (خبرونه)
  - 🎭 Entertainment (ساعت تیري)
  - ⚽ Sports (لوبې / سپورټ)
  - 🕌 Islamic (اسلامي)
  - 🎬 Movies (فلمونه)
  - 📻 Radio (راډیو)
- **📹 Modern HLS Live Player**: High quality live video playback with support for HLS (.m3u8), direct stream links, custom video embeds, resolution quality switcher, picture-in-picture, and full-screen mode.
- **⭐ Favorites & Watch History**: Save favorite channels to local storage for quick access anytime.
- **🇦🇫 Afghan Style Dark Theme**: Premium dark layout with gold/emerald accents and full Pashto (پښتو), Dari (دري), and English support with RTL/LTR dynamic layout alignment.
- **⚡ Pure Frontend Architecture**: Zero backend server required! Deploys directly as static files on GitHub Pages, Vercel, Netlify, or any static web host.

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have Node.js (version 18 or higher) installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/zama-tv.git
cd zama-tv
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

---

## 🛠️ Building for Production

To compile the static production assets into the `dist` folder:

```bash
npm run build
```

This will produce the following output structure inside `dist/`:
```
dist/
├── index.html
└── assets/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

You can test the production build locally with:
```bash
npm run preview
```

---

## 🌐 Deploying to GitHub Pages

This project includes an automated GitHub Action workflow (`.github/workflows/build.yml`) that builds and deploys your site to GitHub Pages whenever code is pushed to the `main` or `master` branch.

### Manual GitHub Pages Configuration:
1. Push your repository to GitHub.
2. Navigate to **Settings** > **Pages** in your GitHub repository.
3. Under **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/build.yml` will automatically build the project and publish the `dist` folder to your site URL.

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── build.yml      # Automated GitHub Actions build & deploy
├── public/                # Static public assets (icons, images)
├── src/
│   ├── components/        # UI Components (Player, Cards, Header, Footer)
│   ├── data/
│   │   ├── channels.ts    # Afghan TV & Radio Channel Database
│   │   ├── news.ts        # News Ticker feeds
│   │   └── translations.ts# Language translations (Pashto, Dari, English)
│   ├── lib/               # Utility functions & helpers
│   ├── App.tsx            # Main Application Component
│   ├── main.tsx           # Application Entry point
│   ├── types.ts           # TypeScript interfaces & types
│   └── index.css          # Tailwind CSS styling
├── index.html             # Base HTML template
├── package.json           # Node dependencies & build scripts
├── vite.config.js         # Vite configuration
└── README.md              # Documentation
```

---

## 📺 Adding New Channels

To add new TV or Radio channels, simply update the array in `src/data/channels.ts`:

```typescript
{
  id: 'my-custom-channel',
  number: 25,
  name: 'My Custom TV',
  pashtoName: 'زما خاص تلویزیون',
  category: 'news',
  logo: 'https://example.com/logo.png',
  streamUrl: 'https://example.com/live/stream.m3u8',
  quality: '1080p',
  isRadio: false,
  likes: 120,
  province: 'kabul'
}
```

---

## 📄 License
This project is open-source and released under the [Apache 2.0 License](LICENSE).
