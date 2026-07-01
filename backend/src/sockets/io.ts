import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIo = (io: Server) => {
  ioInstance = io;
};

export const getIo = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.io server has not been initialized');
  }

  return ioInstance;
};
