import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.EXPO_PUBLIC_SOCKET_URL, {
  autoConnect: false,
});

export default socket;
