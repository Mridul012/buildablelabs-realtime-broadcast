import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { registerStreamSocket } from './sockets/stream.socket';
import { registerChatSocket } from './sockets/chat.socket';
import { setIo } from './sockets/io';

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

setIo(io);
registerStreamSocket(io);
registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
