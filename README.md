# Multiplayer Games

Play your favorite games with friends online! Starting with UNO, with more games coming soon.

## Features

- **Real-time Multiplayer** - Powered by PartyKit WebSockets
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
- **Multiplayer**: PartyKit (WebSocket-based real-time communication)
- **Deployment**: Vercel (frontend) + PartyKit (multiplayer server)

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
├── party/               # PartyKit server
│   └── index.ts        # UNO game server
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

You'll need to run both the Next.js dev server and the PartyKit dev server:

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start PartyKit dev server
npm run dev:party
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

### Deploy PartyKit Server

```bash
# Deploy to PartyKit
npm run deploy:party
```

After deploying PartyKit, update your Vercel environment variables:
- `NEXT_PUBLIC_PARTYKIT_HOST` = your deployed PartyKit URL

## Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_PARTYKIT_HOST=127.0.0.1:1999
```

For production, set in Vercel dashboard:

```env
NEXT_PUBLIC_PARTYKIT_HOST=your-project.your-username.partykit.dev
```

## How to Play UNO

1. Visit the home page and click "Play Now" on the UNO card
2. Create a new game room or join an existing one with a room code
3. Share the room code with your friend
4. Once both players join, the game starts automatically
5. Play cards by clicking them, match color or number
6. Don't forget to call "UNO!" when you have one card left!

## License

MIT
