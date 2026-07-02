import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import socket from '../services/socket';
import { EVENTS } from '../services/socket.constants';
import { useStreamStore } from '../store/useStreamStore';

interface ChatBoxProps {
  streamId: string;
  userId: string;
}

interface IncomingMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function ChatBox({ streamId, userId }: ChatBoxProps) {
  const [content, setContent] = useState('');

  const messages = useStreamStore((state) => state.messages);
  const setMessages = useStreamStore((state) => state.setMessages);

  useEffect(() => {
    const handleReceiveMessage = (message: IncomingMessage) => {
      setMessages([...useStreamStore.getState().messages, message]);
    };

    socket.on(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [setMessages]);

  const handleSend = () => {
    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    socket.emit(EVENTS.SEND_MESSAGE, { streamId, userId, content: trimmed });
    setContent('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.sender.id === userId;

          return (
            <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                {!isMine ? <Text style={styles.username}>{item.sender.username}</Text> : null}
                <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#6B7280"
          value={content}
          onChangeText={setContent}
        />

        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            !content.trim() && styles.sendButtonDisabled,
            pressed && content.trim() && styles.sendButtonPressed,
          ]}
          onPress={handleSend}
          disabled={!content.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  list: {
    maxHeight: 200,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
  },
  username: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
  },
  messageTextMine: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
