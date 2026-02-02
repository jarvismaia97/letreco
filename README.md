# Letreco Web

Portuguese Wordle clone built with React, TypeScript, and CSS.

## Features

- 🇵🇹 Portuguese word lists (4/5/6/7 letter modes)
- 📅 Daily word mode (deterministic by date)
- 🎯 Practice mode with unlimited random words
- 📱 Fully responsive (mobile-first design)
- 🌙 Dark/Light theme with system preference detection
- 📊 Statistics tracking with streak counters
- 🎮 Portuguese keyboard layout (including Ç)
- ✨ Tile flip animations
- 📱 PWA ready (Add to Home Screen)
- 📋 Share results functionality
- ⌨️ Physical keyboard support
- 💾 LocalStorage persistence

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Plain CSS with CSS modules approach
- **State Management:** React hooks + Context
- **Storage:** localStorage
- **PWA:** Service Worker + Web App Manifest

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The app is configured for Vercel deployment. Build output is in `dist/` directory.

## Game Rules

- Guess the Portuguese word in 6 attempts
- Each guess must be a valid word
- Colors indicate:
  - 🟩 Green: Correct letter in correct position
  - 🟨 Yellow: Correct letter in wrong position  
  - ⬛ Gray: Letter not in word

## Responsive Design

- Mobile-first approach
- Touch-friendly keyboard (minimum 44px touch targets)
- Safe area padding for notched devices
- Adaptive tile sizing based on viewport
- Optimized for portrait orientation
- Works on screens from 320px to desktop

## Browser Support

- Modern browsers with ES6+ support
- PWA features require HTTPS
- Service Worker support for offline functionality

## Credits

Original Wordle created by Josh Wardle. This is a Portuguese adaptation.