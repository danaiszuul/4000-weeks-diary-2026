# 4000 Weeks · 2026 Diary

Ultra-minimal mobile-first diary focused on what truly matters, inspired by Stoicism and the *4000 Weeks* philosophy.

## Philosophy

- **4000 Weeks Perspective**: Visualize your life as ~4,680 weeks (90 years) to focus on what matters
- **Stoic Wisdom**: Daily quotes and prompts from Marcus Aurelius, Seneca, and Epictetus
- **Anti-Perfectionism**: Track only outcomes that matter, not every detail
- **Finitude as Motivation**: Use mortality awareness to prioritize ruthlessly

## Features

### Three Screens

1. **Today** - Daily focus card
   - Life week progress tracker
   - Stoic quote + micro-prompt (rotates daily by theme)
   - 3 fields: "Today truly matters if..."
   - Evening reflection (3 minimal inputs)

2. **This Week** - Weekly planning
   - Core focus (1 thing that must move forward)
   - Support move (optional)
   - Not-to-do list (3 things to intentionally ignore)
   - End-of-week reflection

3. **Life Bar** - 4000 weeks dashboard
   - Visual progress bar of life lived vs. remaining
   - Stats: weeks lived, weeks remaining
   - Stoic perspective reminders

### Technical Features

- **localStorage persistence** - All entries auto-save locally
- **48 Stoic quotes** organized by monthly themes
- **Futuristic glassmorphism UI** - Cyber cyan/magenta/violet on dark gradient
- **Mobile-first** with bottom tab navigation
- **PWA-ready** - Works offline after first load

## Tech Stack

- React 19
- Vite 5
- Tailwind CSS 3
- localStorage for data persistence
- Netlify for hosting

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

Configured for automatic deployment on Netlify via GitHub integration.

### Manual Deployment

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## Customization

- **Birth year**: Set on first visit (stored in localStorage)
- **Life expectancy**: Defaults to 90 years (configurable in `src/utils/lifeWeeks.js`)
- **Quotes**: Add/edit in `src/data/quotes.js`
- **Theme colors**: Modify in `tailwind.config.js`

## License

MIT
