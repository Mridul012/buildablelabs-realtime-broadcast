import { registerGlobals } from '@livekit/react-native';
import { Room } from 'livekit-client';

export const createLiveKitRoom = () => {
  registerGlobals();

  return new Room();
};
