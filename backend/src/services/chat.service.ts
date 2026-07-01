import { prisma, NotFoundError } from './broadcast.service';

export class StreamNotLiveError extends Error {
  statusCode = 400;
}

export const sendMessage = async (streamId: string, userId: string, content: string) => {
  const stream = await prisma.stream.findUnique({ where: { id: streamId } });

  if (!stream) {
    throw new NotFoundError('Stream not found');
  }

  if (!stream.isLive) {
    throw new StreamNotLiveError('Stream is not live');
  }

  const sender = await prisma.user.findUnique({ where: { id: userId } });

  if (!sender) {
    throw new NotFoundError('User not found');
  }

  return prisma.message.create({
    data: {
      streamId,
      senderId: userId,
      content,
    },
    include: {
      sender: {
        select: { id: true, username: true },
      },
    },
  });
};
