# Ting Random - Wheel & Reel Spinning App

A Next.js application with Socket.IO for real-time wheel and reel spinning functionality.

## Project Structure

```
tingrandom/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/
│   │   └── socket/
│   │       └── route.ts
│   ├── display/
│   │   └── page.tsx
│   ├── control/
│   │   └── page.tsx
│   └── campaign/
│       └── page.tsx
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Header.module.css
│   ├── Wheel/
│   │   ├── Wheel.tsx
│   │   └── Wheel.module.css
│   ├── Reel/
│   │   ├── Reel.tsx
│   │   └── Reel.module.css
│   ├── ControlPanel/
│   │   ├── ControlPanel.tsx
│   │   └── ControlPanel.module.css
│   └── CampaignSetup/
│       ├── CampaignSetup.tsx
│       └── CampaignSetup.module.css
├── lib/
│   ├── socket.ts
│   ├── mongodb.ts
│   └── types.ts
├── models/
│   ├── Campaign.ts
│   └── Session.ts
├── public/
│   └── images/
├── server.js
└── package.json
```

## Features

- **Wheel Spinning**: Interactive spinning wheel with customizable items
- **Reel Spinning**: Slot machine-style reel functionality
- **Real-time Updates**: Socket.IO for live synchronization
- **Campaign Management**: Create and manage spinning campaigns
- **Control Panel**: Remote control functionality
- **Display Mode**: Dedicated display view for results

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/tingrandom
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Run development server with Socket.IO
- `npm run dev:next` - Run Next.js development server only
- `npm run build` - Build the application
- `npm run start` - Start production server with Socket.IO
- `npm run start:next` - Start Next.js production server only
- `npm run lint` - Run ESLint

## Pages

- `/` - Main application page
- `/display` - Display mode for showing results
- `/control` - Control panel for managing spins
- `/campaign` - Campaign setup and management

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Socket.IO** - Real-time communication
- **MongoDB & Mongoose** - Database
- **GSAP** - Animations
- **Framer Motion** - UI animations
- **CSS Modules** - Component styling
