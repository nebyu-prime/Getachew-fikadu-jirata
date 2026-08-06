# Getachew Fikadu Ekub

A Telegram Mini App built with Next.js 15, React, TypeScript, Tailwind CSS, and the Telegram Mini Apps SDK.

## What is included

- Mobile-first responsive UI for Telegram Mini Apps
- Blue, white, and gold visual theme
- Card-based layout with glassmorphism and soft shadows
- Live countdown timer using React hooks
- Mock ticket statistics and recent winner data
- Reusable typed components
- Firebase-ready environment helpers

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
copy .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

## Firebase prep

When you are ready to connect Firebase, add the values in `.env.local` and wire the SDK into `src/lib/firebase.ts`.

## Telegram Mini Apps

The app reads Telegram Web App state from the browser environment in `src/lib/telegram.ts`. When opened inside Telegram, the header can show the current user avatar if Telegram provides one.
