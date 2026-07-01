import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView } from '@livekit/react-native';
import type { LocalVideoTrack } from 'livekit-client';
import { createStream, getStreamToken, endStream } from '../services/stream.service';
import { connectCreator, disconnectCreator } from '../services/livekit.service';
import { EVENTS } from '../services/socket.constants';
import socket from '../services/socket';
import { useStreamStore } from '../store/useStreamStore';
import ChatBox from '../components/ChatBox';

const TEMP_CREATOR_ID = 'cmr38cogf0000y6ev9bq2nl9q';

export default function CreatorScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>(undefined);

  const currentStream = useStreamStore((state) => state.currentStream);
  const viewerCount = useStreamStore((state) => state.viewerCount);
  const setCurrentStream = useStreamStore((state) => state.setCurrentStream);
  const setViewerCount = useStreamStore((state) => state.setViewerCount);
  const setMessages = useStreamStore((state) => state.setMessages);
  const setIsStreaming = useStreamStore((state) => state.setIsStreaming);

  useEffect(() => {
    return () => {
      disconnectCreator();
      socket.off(EVENTS.VIEWER_COUNT_UPDATED);
      socket.disconnect();
    };
  }, []);

  const handleStartStreaming = async () => {
    if (!title.trim()) {
      Alert.alert('Title is required');
      return;
    }

    setIsStarting(true);

    try {
      setStatus('Creating stream...');
      const { stream } = await createStream(title.trim(), TEMP_CREATOR_ID);
      setCurrentStream(stream);

      setStatus('Requesting LiveKit token...');
      const { token, url } = await getStreamToken(stream.id, TEMP_CREATOR_ID, 'creator');

      setStatus('Connecting to LiveKit...');
      const { videoTrack } = await connectCreator(url, token);
      setLocalVideoTrack(videoTrack);

      setStatus('Connecting to chat server...');
      socket.connect();
      socket.emit(EVENTS.JOIN_STREAM, { streamId: stream.id, userId: TEMP_CREATOR_ID });
      socket.on(EVENTS.VIEWER_COUNT_UPDATED, (data: { viewerCount: number }) => {
        setViewerCount(data.viewerCount);
      });

      setIsStreaming(true);
      setStatus('Streaming live');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndStream = async () => {
    if (!currentStream) {
      return;
    }

    setIsEnding(true);

    try {
      await disconnectCreator();

      socket.emit(EVENTS.LEAVE_STREAM, { streamId: currentStream.id, userId: TEMP_CREATOR_ID });

      socket.disconnect();

      await endStream(currentStream.id);

      setCurrentStream(null);
      setViewerCount(0);
      setMessages([]);
      setIsStreaming(false);
      setLocalVideoTrack(undefined);

      router.replace('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
      setIsEnding(false);
    }
  };

  const isLive = Boolean(currentStream);

  return (
    <View style={[styles.container, !isLive && styles.containerCentered]}>
      <Text style={styles.heading}>Go Live</Text>

      {!isLive ? (
        <TextInput
          style={styles.input}
          placeholder="Enter Stream Title"
          placeholderTextColor="#6B7280"
          value={title}
          onChangeText={setTitle}
          editable={!isStarting}
        />
      ) : null}

      {!isLive ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            isStarting && styles.buttonDisabled,
            pressed && !isStarting && styles.buttonPressed,
          ]}
          onPress={handleStartStreaming}
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Start Streaming</Text>
          )}
        </Pressable>
      ) : null}

      {status && !isLive ? (
        <View style={styles.statusRow}>
          {isStarting ? <ActivityIndicator size="small" color="#6B7280" /> : null}
          <Text style={styles.status}>{status}</Text>
        </View>
      ) : null}

      {isLive && localVideoTrack ? (
        <VideoView videoTrack={localVideoTrack} mirror style={styles.video} />
      ) : null}

      {isLive ? (
        <View style={styles.liveCard}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>

          <View style={styles.viewerCard}>
            <Text style={styles.viewerCardLabel}>Viewers</Text>
            <Text style={styles.viewerCardValue}>{viewerCount}</Text>
          </View>
        </View>
      ) : null}

      {isLive ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.dangerButton,
            isEnding && styles.buttonDisabled,
            pressed && !isEnding && styles.buttonPressed,
          ]}
          onPress={handleEndStream}
          disabled={isEnding}
        >
          {isEnding ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>End Stream</Text>
          )}
        </Pressable>
      ) : null}

      {currentStream ? (
        <>
          <Text style={styles.chatHeading}>Live Chat</Text>
          <ChatBox streamId={currentStream.id} userId={TEMP_CREATOR_ID} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 24,
    gap: 16,
  },
  containerCentered: {
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  chatHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  video: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
  },
  liveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#22C55E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  viewerCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  viewerCardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
