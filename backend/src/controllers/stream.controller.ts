import { Request, Response } from 'express';
import {
  createStream,
  getLiveStreams,
  getStreamById,
  endStream,
  NotFoundError,
  AlreadyEndedError,
} from '../services/broadcast.service';
import {
  generateStreamToken,
  InvalidRoleError,
  StreamNotLiveError,
} from '../services/livekit.service';
import { notifyStreamStarted, notifyStreamEnded } from '../services/n8n.service';
import { getIo } from '../sockets/io';
import { EVENTS, ROOMS } from '../sockets/socket.constants';

export const createStreamHandler = async (req: Request, res: Response) => {
  const { creatorId, title } = req.body;

  if (!creatorId || !title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'creatorId and title are required',
    });
  }

  try {
    const stream = await createStream(creatorId, title.trim());

    notifyStreamStarted({
      streamId: stream.id,
      title: stream.title,
      creatorId: stream.creatorId,
      creatorUsername: stream.creator.username,
      startedAt: stream.startedAt,
    });

    return res.status(201).json({
      success: true,
      stream,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getLiveStreamsHandler = async (_req: Request, res: Response) => {
  try {
    const streams = await getLiveStreams();

    return res.status(200).json({
      success: true,
      streams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getStreamByIdHandler = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const stream = await getStreamById(id);

    return res.status(200).json({
      success: true,
      stream,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const endStreamHandler = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const stream = await endStream(id);

    if (stream.endedAt) {
      getIo().to(ROOMS.STREAM(stream.id)).emit(EVENTS.STREAM_ENDED, {
        streamId: stream.id,
      });

      notifyStreamEnded({
        streamId: stream.id,
        title: stream.title,
        creatorId: stream.creatorId,
        startedAt: stream.startedAt,
        endedAt: stream.endedAt,
        finalViewerCount: stream.viewerCount,
      });
    }

    return res.status(200).json({
      success: true,
      stream,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof AlreadyEndedError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const generateStreamTokenHandler = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({
      success: false,
      message: 'userId and role are required',
    });
  }

  try {
    const { token, url } = await generateStreamToken(id, userId, role);

    return res.status(200).json({
      success: true,
      token,
      url,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error instanceof StreamNotLiveError || error instanceof InvalidRoleError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
