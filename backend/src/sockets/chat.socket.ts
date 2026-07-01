import { Server } from 'socket.io';
import { sendMessage } from '../services/chat.service';
import { EVENTS, ROOMS } from './socket.constants';

interface SendMessagePayload {
  streamId: string;
  userId: string;
  content: string;
}

const isValidPayload = (payload: Partial<SendMessagePayload>): payload is SendMessagePayload => {
  return Boolean(
    payload.streamId &&
      payload.userId &&
      payload.content &&
      typeof payload.content === 'string' &&
      payload.content.trim().length > 0
  );
};

export const registerChatSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on(EVENTS.SEND_MESSAGE, async (payload: Partial<SendMessagePayload>) => {
      try {
        if (!isValidPayload(payload)) {
          return;
        }

        const { streamId, userId, content } = payload;

        const message = await sendMessage(streamId, userId, content.trim());

        io.to(ROOMS.STREAM(streamId)).emit(EVENTS.RECEIVE_MESSAGE, {
          id: message.id,
          streamId: message.streamId,
          sender: {
            id: message.sender.id,
            username: message.sender.username,
          },
          content: message.content,
          createdAt: message.createdAt,
        });
      } catch (error) {
        // invalid/unsendable message — ignore silently, never crash or disconnect the socket
      }
    });
  });
};
