# System Architecture Diagram

Placeholder for the high-level system architecture diagram.

Export the final diagram (draw.io / Excalidraw / Figma) as `system-architecture.png` into this folder and embed it below:

```
![System Architecture](./system-architecture.png)
```

Suggested contents to depict:
- Mobile app (Expo) <-> Backend (Express + Socket.io) <-> PostgreSQL (Prisma)
- Mobile app <-> LiveKit Cloud (SFU) for live video
- Backend <-> LiveKit Cloud (server SDK) for room/token management
- Backend <-> n8n (webhooks) for automation workflows
