import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { LogLevel, LoggerNames, setLogLevel } from 'livekit-client';

// livekit-client's dimension-detection timeout doesn't account for React Native's
// native camera capturer startup delay, so this fires on nearly every publish and
// falls back to a correct default — known upstream limitation, not an app bug.
// This only hides the in-app red-screen overlay; the message still reaches the
// Metro terminal, since LogBox doesn't touch the underlying console call.
LogBox.ignoreLogs(['could not determine track dimensions']);

// Silence it at the source too, so it stops appearing in the Metro terminal.
// Trade-off: this mutes the entire 'livekit-participant' logger, not just this one
// message — there's no finer-grained control in the SDK's public API. If you ever
// need to see other participant/track-level SDK logs again, remove this line.
setLogLevel(LogLevel.silent, LoggerNames.Participant);

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
