# BuildableLabs Real-Time Broadcast Platform

A full-stack real-time live broadcasting platform built with React Native, Node.js, LiveKit, Socket.io, PostgreSQL, Prisma, and n8n.

The platform enables creators to start live broadcasts, viewers to join and watch in real time, chat during streams, and trigger automated workflows.

---

# Features

## Phase 1 — Real-Time Broadcasting

### Creator
- Start a live stream
- Publish live video and audio using LiveKit
- View the live viewer count
- Send and receive chat messages
- End the live stream

### Viewer
- Browse active live streams
- Join a stream instantly
- Watch live video and audio
- Send and receive chat messages
- View live viewer count updates

### Real-Time Features
- LiveKit-powered video and audio streaming
- Socket.io real-time chat
- Live viewer count synchronization
- Complete stream lifecycle management

---

## Phase 3 — Automation (n8n)

Implemented workflows:

- Notify followers when a creator starts streaming
- Notify creators when viewer milestones are reached
- Generate stream highlights when a stream ends
- Generate a scheduled daily digest of top streams

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Mobile | React Native, Expo, TypeScript |
| Backend | Node.js, Express |
| Real-Time Communication | Socket.io |
| Live Streaming | LiveKit Cloud |
| Database | PostgreSQL + Prisma ORM |
| Automation | n8n |
| State Management | Zustand |

---

# Project Structure

```text
buildablelabs-realtime-broadcast/

├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── index.ts
│   └── package.json
│
├── mobile/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── store/
│   └── package.json
│
├── n8n-workflows/
│
└── README.md
```

---

# Architecture Overview

```text
              Creator App
                    │
                    │
             LiveKit Cloud
                    │
                    │
              Viewer App

                    │
                    ▼

         Express + Socket.io API
                    │
                    ▼

      PostgreSQL Database (Prisma)

                    │
                    ▼

            n8n Automation
```

---

# Getting Started

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Neon PostgreSQL)
- LiveKit Cloud project
- n8n
- Expo SDK
- Xcode (for iOS development)

---

# Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=

PORT=4000

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

N8N_STREAM_STARTED_WEBHOOK_URL=
N8N_VIEWER_MILESTONE_WEBHOOK_URL=
N8N_STREAM_ENDED_WEBHOOK_URL=
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

---

# Mobile Setup

```bash
cd mobile
npm install
```

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SOCKET_URL=
```

Generate the native project:

```bash
npx expo prebuild
```

Run on iOS:

```bash
npx expo run:ios
```

> **Note:** Since the project uses LiveKit and react-native-webrtc, it requires an Expo Development Build and will not run in Expo Go.

---

# n8n Setup

1. Start an n8n instance.
2. Import the workflow JSON files from the `n8n-workflows/` directory.
3. Configure the PostgreSQL and webhook credentials.
4. Update the webhook URLs in the backend `.env` file.

---

# Key Features

- Live video broadcasting
- Live audio broadcasting
- Real-time chat
- Live viewer count synchronization
- Stream discovery
- Automated notifications
- Daily analytics workflow

---

# Repository Contents

| Folder | Description |
|---------|-------------|
| backend | Express backend, REST APIs, Socket.io server and Prisma integration |
| mobile | React Native (Expo) application |
| n8n-workflows | Exported n8n automation workflows |

---

# Author

**Mridul**