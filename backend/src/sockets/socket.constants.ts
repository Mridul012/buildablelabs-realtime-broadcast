export const EVENTS = {
  JOIN_STREAM: 'join-stream',
  LEAVE_STREAM: 'leave-stream',
  VIEWER_COUNT_UPDATED: 'viewer-count-updated',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  STREAM_ENDED: 'stream-ended',
} as const;

const STREAM_ROOM_PREFIX = 'stream:';

export const ROOMS = {
  STREAM: (streamId: string) => `${STREAM_ROOM_PREFIX}${streamId}`,
  isStreamRoom: (room: string) => room.startsWith(STREAM_ROOM_PREFIX),
  getStreamId: (room: string) => room.slice(STREAM_ROOM_PREFIX.length),
};
