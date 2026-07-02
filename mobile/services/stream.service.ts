import axios from 'axios';
import api from './api';

export type StreamRole = 'creator' | 'viewer';

const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return new Error(message || error.message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unexpected error');
};

export const createStream = async (title: string, creatorId: string) => {
  try {
    const response = await api.post('/streams', { title, creatorId });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getStreamToken = async (streamId: string, userId: string, role: StreamRole) => {
  try {
    const response = await api.post(`/streams/${streamId}/token`, { userId, role });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getLiveStreams = async () => {
  try {
    const response = await api.get('/streams');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getStream = async (streamId: string) => {
  try {
    const response = await api.get(`/streams/${streamId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const endStream = async (streamId: string) => {
  try {
    const response = await api.patch(`/streams/${streamId}/end`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
