# BuildableLabs Real-Time Broadcast Platform

A full-stack real-time live broadcasting platform.
The platform enables creators to start live broadcasts, viewers to join and watch in real time, chat during the stream, and trigger automated workflows using n8n.

---

# Features

## Phase 1 — Real-Time Broadcasting

### Creator
- Start a live stream
- Publish live video and audio using LiveKit
- View live viewer count
- Read and send chat messages
- End the live stream

### Viewer
- Browse active live streams
- Join a stream instantly
- Watch live video and audio
- Send and receive chat messages
- View live viewer count updates

### Real-Time Features
- LiveKit video/audio streaming
- Socket.io powered real-time chat
- Live viewer count synchronization
- Stream lifecycle management


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
├── docs/
│
└── README.md
```

---

# Architecture Overview

```
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

Detailed architecture and diagrams are available inside the **docs/** directory.

---

# Getting Started

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Neon PostgreSQL)
- LiveKit Cloud Project
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

Run the backend:

```bash
npm run dev
```

Build:

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

Run:

```bash
npx expo prebuild
```

```bash
npx expo run:ios
```

---

# n8n Setup

1. Start n8n.
2. Import all workflow JSON files from:

```
n8n-workflows/
```

3. Configure PostgreSQL and webhook credentials.
4. Update the webhook URLs inside the backend `.env`.

---

# Key Features

- Live video broadcasting
- Live audio broadcasting
- Real-time chat
- Live viewer count
- Stream discovery
- Automated notifications
- Daily analytics workflow


---


# Repository Contents

| Folder | Description |
|---------|-------------|
| backend | Express backend and REST APIs |
| mobile | React Native application |
| n8n-workflows | Exported automation workflows |
| docs | Architecture diagrams and documentation |

---



# Author

**Mridul**

