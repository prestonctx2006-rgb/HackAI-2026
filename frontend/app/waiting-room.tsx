import { useEffect, useState, useRef } from 'react';
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
  const [playerCount, setPlayerCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll room status every 2 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/room-status/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        setPlayerCount(data.playerCount ?? 1);

        // If game is starting, navigate to game screen
        if (data.status === 'starting') {
          clearInterval(intervalRef.current!);
          // TODO: navigate to game screen when ready
          // router.replace({ pathname: '/game', params: { code } });
        }
      } catch (e) {
        // server unreachable, ignore
      }
    };

    poll(); // run immediately
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code]);

  const handleLeave = async () => {
    try {
      await fetch(`http://localhost:8000/leave-room/${code}`, {
        method: 'POST',
      });
    } catch (e) {
      // ignore errors on leave
    }
    router.replace('/(tabs)/play');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/Globe1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <View style={styles.container}>

        <Text style={styles.heading}>Waiting for Players...</Text>
        <Text style={styles.subheading}>
          Share this code with your teammates
        </Text>

        {/* Room code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeText}>{code}</Text>
        </View>

        {/* Player count */}
        <View style={styles.playerCountCard}>
          <Text style={styles.playerCountNumber}>{playerCount}/3</Text>
          <Text style={styles.playerCountLabel}>PLAYERS JOINED</Text>
        </View>

        {/* Waiting dots */}
        <Text style={styles.waitingText}>
          {playerCount === 3 ? '🟢 Starting game...' : '🟡 Waiting for players to join'}
        </Text>

        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={handleLeave}
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
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 20,
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
  playerCountCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  playerCountNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  playerCountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginTop: 4,
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