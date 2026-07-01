import { Server, Socket } from 'socket.io';
import { incrementViewerCount, decrementViewerCount } from '../services/broadcast.service';
import { notifyViewerMilestone } from '../services/n8n.service';
import { EVENTS, ROOMS } from './socket.constants';

interface StreamPresencePayload {
  streamId: string;
  userId: string;
}

const VIEWER_MILESTONES = [100];

const broadcastViewerCount = (io: Server, streamId: string, viewerCount: number) => {
  io.to(ROOMS.STREAM(streamId)).emit(EVENTS.VIEWER_COUNT_UPDATED, {
    streamId,
    viewerCount,
  });
};

const getJoinedStreamIds = (socket: Socket) => {
  return Array.from(socket.rooms).filter(ROOMS.isStreamRoom).map(ROOMS.getStreamId);
};

export const registerStreamSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on(EVENTS.JOIN_STREAM, async ({ streamId }: StreamPresencePayload) => {
      const room = ROOMS.STREAM(streamId);

      if (socket.rooms.has(room)) {
        return;
      }

      socket.join(room);

      const stream = await incrementViewerCount(streamId);

      broadcastViewerCount(io, streamId, stream.viewerCount);

      if (VIEWER_MILESTONES.includes(stream.viewerCount)) {
        notifyViewerMilestone({
          streamId: stream.id,
          title: stream.title,
          viewerCount: stream.viewerCount,
        });
      }
    });

    socket.on(EVENTS.LEAVE_STREAM, async ({ streamId }: StreamPresencePayload) => {
      socket.leave(ROOMS.STREAM(streamId));

      const stream = await decrementViewerCount(streamId);

      if (stream) {
        broadcastViewerCount(io, streamId, stream.viewerCount);
      }
    });

    socket.on('disconnecting', async () => {
      const streamIds = getJoinedStreamIds(socket);

      for (const streamId of streamIds) {
        const stream = await decrementViewerCount(streamId);

        if (stream) {
          broadcastViewerCount(io, streamId, stream.viewerCount);
        }
      }
    });
  });
};
