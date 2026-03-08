import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function WaitingRoom() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  return (
    <ImageBackground
      source={require('@/assets/images/Globe1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <View style={styles.container}>

        {/* Header */}
        <Text style={styles.heading}>Waiting for Players...</Text>
        <Text style={styles.subheading}>
          Share this code with your teammates
        </Text>

        {/* Room code display */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeText}>{code}</Text>
        </View>

        <Text style={styles.waitingText}>
          🟡 Waiting for all players to join
        </Text>

        {/* Leave button */}
        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.leaveBtnText}>Leave Room</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subheading: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },

  // Code card
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 28,
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  codeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  waitingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 48,
  },

  leaveBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  leaveBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
});