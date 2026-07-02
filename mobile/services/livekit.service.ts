import { Room } from 'livekit-client';
import { createLiveKitRoom } from './livekit';

let creatorRoom: Room | null = null;
let viewerRoom: Room | null = null;

const connectRoom = async (url: string, token: string) => {
  const room = createLiveKitRoom();

  await room.connect(url, token);

  return room;
};

export const connectCreator = async (url: string, token: string) => {
  const room = await connectRoom(url, token);

  // Simulcast negotiation is unreliable on iOS React Native (react-native-webrtc) —
  // the video track can be created and locally marked as published while the SFU
  // never fully registers it, so remote viewers never see it. Single-layer publish
  // avoids that negotiation path entirely.
  const cameraPublication = await room.localParticipant.setCameraEnabled(
    true,
    {},
    { simulcast: false }
  );
  await room.localParticipant.setMicrophoneEnabled(true);

  creatorRoom = room;

  return { room, videoTrack: cameraPublication?.videoTrack };
};

export const disconnectCreator = async () => {
  if (!creatorRoom) {
    return;
  }

  await creatorRoom.disconnect();
  creatorRoom = null;
};

export const connectViewer = async (url: string, token: string) => {
  const room = await connectRoom(url, token);

  viewerRoom = room;

  return room;
};

export const disconnectViewer = async () => {
  if (!viewerRoom) {
    return;
  }

  await viewerRoom.disconnect();
  viewerRoom = null;
};
