import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export class NotFoundError extends Error {
  statusCode = 404;
}

export class AlreadyEndedError extends Error {
  statusCode = 400;
}

export const createStream = async (creatorId: string, title: string) => {
  const creator = await prisma.user.findUnique({ where: { id: creatorId } });

  if (!creator) {
    throw new NotFoundError('Creator not found');
  }

  return prisma.stream.create({
    data: {
      title,
      creatorId,
      isLive: true,
      viewerCount: 0,
      startedAt: new Date(),
      endedAt: null,
    },
    include: {
      creator: {
        select: { username: true },
      },
    },
  });
};

export const getLiveStreams = () => {
  return prisma.stream.findMany({
    where: { isLive: true },
    orderBy: { startedAt: 'desc' },
    include: {
      creator: {
        select: { username: true },
      },
    },
  });
};

export const getStreamById = async (id: string) => {
  const stream = await prisma.stream.findUnique({
    where: { id },
    include: {
      creator: {
        select: { username: true },
      },
    },
  });

  if (!stream) {
    throw new NotFoundError('Stream not found');
  }

  return stream;
};

export const endStream = async (id: string) => {
  const stream = await prisma.stream.findUnique({ where: { id } });

  if (!stream) {
    throw new NotFoundError('Stream not found');
  }

  if (!stream.isLive) {
    throw new AlreadyEndedError('Stream already ended');
  }

  return prisma.stream.update({
    where: { id },
    data: {
      isLive: false,
      endedAt: new Date(),
    },
  });
};

export const incrementViewerCount = (streamId: string) => {
  return prisma.stream.update({
    where: { id: streamId },
    data: { viewerCount: { increment: 1 } },
  });
};

export const decrementViewerCount = async (streamId: string) => {
  await prisma.stream.updateMany({
    where: { id: streamId, viewerCount: { gt: 0 } },
    data: { viewerCount: { decrement: 1 } },
  });

  return prisma.stream.findUnique({ where: { id: streamId } });
};
