import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Realtime Broadcast</Text>
        <Text style={styles.subtitle}>Go live or watch creators stream in real time.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.push('/creator')}
        >
          <Text style={styles.buttonIcon}>🎥</Text>
          <Text style={styles.buttonText}>Start Streaming</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          onPress={() => router.push('/viewer')}
        >
          <Text style={styles.buttonIcon}>👀</Text>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Watch Stream</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F8F9FA',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#111827',
  },
});
