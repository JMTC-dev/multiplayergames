# Multiplayer Games

Play your favorite games with friends online! Starting with UNO, with more games coming soon.

## Features

- **Real-time Multiplayer** - Powered by Rivet WebSockets on Vercel Functions
- **Mobile-Friendly** - Optimized for touch screens and mobile devices
- **Room-Based Games** - Create or join game rooms with easy-to-share codes
- **Modern Stack** - Built with Next.js 15, TypeScript, and Tailwind CSS

## Games

- ✅ **UNO** - Classic card game (In Development)
- 🔜 **Connect 4** - Drop and connect (Coming Soon)
- 🔜 **Battleships** - Sink the fleet (Coming Soon)
- 🔜 **Chess** - Classic strategy (Coming Soon)
- 🔜 **Checkers** - Jump and capture (Coming Soon)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Multiplayer**: Rivet (WebSocket-based real-time communication on Vercel Functions)
- **Deployment**: Vercel (everything in one deployment!)

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── uno/               # UNO game page
│   ├── lobby/             # Game lobby page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── games/            # Game-specific components
│       └── uno/          # UNO game components
├── lib/                  # Utilities and game logic
│   ├── games/           # Game logic
│   │   └── uno/         # UNO game logic
│   │       ├── types/   # TypeScript types
│   │       └── logic/   # Game rules engine
│   └── utils/           # Shared utilities
├── rivet/               # Rivet actor registry
│   └── registry.ts     # UNO game server actor
├── app/api/rivet/       # Rivet API route
│   └── [...all]/route.ts  # Actor endpoint
└── public/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

With Rivet, everything runs in one command! No separate server needed:

```bash
# Start Next.js dev server (Rivet actors included)
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

With Rivet, everything deploys together in a single step!

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy (includes both frontend and Rivet actors)
vercel
```

**That's it!** No separate deployments, no environment variables needed. Rivet actors run on Vercel Functions.

## Environment Variables

**No environment variables needed!** Rivet runs on the same domain as your Next.js app, so everything works automatically in both development and production.

## How to Play UNO

1. Visit the home page and click "Play Now" on the UNO card
2. Create a new game room or join an existing one with a room code
3. Share the room code with your friend
4. Once both players join, the game starts automatically
5. Play cards by clicking them, match color or number
6. Don't forget to call "UNO!" when you have one card left!

## License

MIT
