import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { VideoView } from '@livekit/react-native';
import { RoomEvent, Track, type RemoteVideoTrack } from 'livekit-client';
import { getLiveStreams, getStreamToken } from '../services/stream.service';
import { connectViewer, disconnectViewer } from '../services/livekit.service';
import { EVENTS } from '../services/socket.constants';
import socket from '../services/socket';
import { useStreamStore } from '../store/useStreamStore';
import ChatBox from '../components/ChatBox';

const TEMP_VIEWER_ID = 'cmr38kkuc0001y6ojtl5kq49m';

interface LiveStream {
  id: string;
  title: string;
  viewerCount: number;
  creatorId: string;
  creator: {
    username: string;
  };
}

export default function ViewerScreen() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [videoTrack, setVideoTrack] = useState<RemoteVideoTrack | undefined>(undefined);

  const currentStream = useStreamStore((state) => state.currentStream);
  const viewerCount = useStreamStore((state) => state.viewerCount);
  const setCurrentStream = useStreamStore((state) => state.setCurrentStream);
  const setViewerCount = useStreamStore((state) => state.setViewerCount);
  const setMessages = useStreamStore((state) => state.setMessages);

  const fetchStreams = useCallback(async () => {
    try {
      const { streams } = await getLiveStreams();
      setStreams(streams);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
    }
  }, []);

  useEffect(() => {
    fetchStreams().finally(() => setIsLoadingStreams(false));
  }, [fetchStreams]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStreams();
    setIsRefreshing(false);
  };

  useEffect(() => {
    return () => {
      disconnectViewer();
      socket.off(EVENTS.VIEWER_COUNT_UPDATED);
      socket.off(EVENTS.STREAM_ENDED);
      socket.disconnect();
    };
  }, []);

  const handleStreamEnded = useCallback(async () => {
    await disconnectViewer();
    socket.off(EVENTS.VIEWER_COUNT_UPDATED);
    socket.off(EVENTS.STREAM_ENDED);
    socket.disconnect();

    setVideoTrack(undefined);
    setCurrentStream(null);
    setViewerCount(0);
    setMessages([]);

    Alert.alert('Stream ended', 'The creator has ended this stream.');

    fetchStreams();
  }, [fetchStreams, setCurrentStream, setMessages, setViewerCount]);

  const handleWatchStream = async (stream: LiveStream) => {
    setIsConnecting(true);

    try {
      setStatus('Requesting LiveKit token...');
      const { token, url } = await getStreamToken(stream.id, TEMP_VIEWER_ID, 'viewer');

      setStatus('Connecting to LiveKit...');
      const room = await connectViewer(url, token);

      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (publication.track && publication.kind === Track.Kind.Video) {
            setVideoTrack(publication.track as RemoteVideoTrack);
          }
        });
      });

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          setVideoTrack(track as RemoteVideoTrack);
        }
      });

      setCurrentStream({
        id: stream.id,
        title: stream.title,
        isLive: true,
        viewerCount: stream.viewerCount,
        creatorId: stream.creatorId,
      });

      setStatus('Connecting to chat server...');
      socket.connect();
      socket.emit(EVENTS.JOIN_STREAM, { streamId: stream.id, userId: TEMP_VIEWER_ID });
      socket.on(EVENTS.VIEWER_COUNT_UPDATED, (data: { viewerCount: number }) => {
        setViewerCount(data.viewerCount);
      });
      socket.on(EVENTS.STREAM_ENDED, handleStreamEnded);

      setStatus('Watching live');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Error', message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <View style={styles.container}>
      {!currentStream ? (
        <>
          <Text style={styles.heading}>Live Streams</Text>

          {isLoadingStreams ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.statusText}>Loading streams...</Text>
            </View>
          ) : (
            <FlatList
              data={streams}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor="#2563EB"
                />
              }
              ListEmptyComponent={
                <View style={styles.centerState}>
                  <Text style={styles.emptyTitle}>No live streams available.</Text>
                  <Text style={styles.emptySubtitle}>Start a stream from another device.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => handleWatchStream(item)}
                  disabled={isConnecting}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>{item.creator.username}</Text>
                  <Text style={styles.cardMeta}>{item.viewerCount} watching</Text>
                </Pressable>
              )}
            />
          )}

          {isConnecting ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#6B7280" />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {videoTrack ? <VideoView videoTrack={videoTrack} style={styles.video} /> : null}

      {currentStream ? (
        <View style={styles.liveCard}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <Text style={styles.viewerCountText}>{viewerCount} watching</Text>
        </View>
      ) : null}

      {currentStream ? <ChatBox streamId={currentStream.id} userId={TEMP_VIEWER_ID} /> : null}
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: '#F8F9FA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#111827',
  },
  cardMeta: {
    fontSize: 13,
    color: '#6B7280',
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  video: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  viewerCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
