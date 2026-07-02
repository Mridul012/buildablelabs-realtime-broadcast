import { create } from 'zustand';

interface Sender {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: Sender;
  createdAt: string;
}

interface Stream {
  id: string;
  title: string;
  isLive: boolean;
  viewerCount: number;
  creatorId: string;
}

interface StreamStore {
  currentStream: Stream | null;
  viewerCount: number;
  messages: Message[];
  isStreaming: boolean;
  setCurrentStream: (stream: Stream | null) => void;
  setViewerCount: (viewerCount: number) => void;
  setMessages: (messages: Message[]) => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

export const useStreamStore = create<StreamStore>((set) => ({
  currentStream: null,
  viewerCount: 0,
  messages: [],
  isStreaming: false,
  setCurrentStream: (stream) => set({ currentStream: stream }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  setMessages: (messages) => set({ messages }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
}));
