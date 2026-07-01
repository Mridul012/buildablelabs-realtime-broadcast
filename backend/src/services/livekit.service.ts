import { AccessToken } from 'livekit-server-sdk';
import { prisma, NotFoundError } from './broadcast.service';
import { ROOMS } from '../sockets/socket.constants';

export type StreamRole = 'creator' | 'viewer';

export class InvalidRoleError extends Error {
  statusCode = 400;
}

export class StreamNotLiveError extends Error {
  statusCode = 400;
}

export const generateStreamToken = async (streamId: string, userId: string, role: StreamRole) => {
  if (role !== 'creator' && role !== 'viewer') {
    throw new InvalidRoleError('role must be "creator" or "viewer"');
  }

  const stream = await prisma.stream.findUnique({ where: { id: streamId } });

  if (!stream) {
    throw new NotFoundError('Stream not found');
  }

  if (!stream.isLive) {
    throw new StreamNotLiveError('Stream is not live');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const accessToken = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: userId,
  });

  accessToken.addGrant({
    room: ROOMS.STREAM(streamId),
    roomJoin: true,
    canPublish: role === 'creator',
    canSubscribe: true,
  });

  const token = await accessToken.toJwt();

  return {
    token,
    url: process.env.LIVEKIT_URL,
  };
};
