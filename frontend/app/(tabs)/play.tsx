import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PlayScreen() {
  const router = useRouter();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.detail);
        return;
      }
      router.replace({ pathname: '/waiting-room', params: { code: data.code } });
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      Alert.alert('Oops!', 'Please enter a room code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/join-room/${roomCode.toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.detail);
        return;
      }
      setJoinModalVisible(false);
      setRoomCode('');
      router.replace({ pathname: '/waiting-room', params: { code: roomCode.toUpperCase() } });
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/Globe1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <View style={styles.centerContent}>
        <Text style={styles.title}>Truth or Terrain</Text>
        <Text style={styles.subtitle}>Going beyond the surface</Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleCreateRoom}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1A1A2E" />
            ) : (
              <Text style={styles.primaryBtnText}>＋ Create Room</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => setJoinModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineBtnText}>🔑 Join Room</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── JOIN ROOM MODAL ── */}
      <Modal visible={joinModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join a Room 🔑</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-character room code from your friend
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="e.g. XK9P2M"
              placeholderTextColor="#9CA3AF"
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleJoinRoom}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Join Room →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setJoinModalVisible(false);
              setRoomCode('');
            }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 48,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  btnGroup: {
    width: '100%',
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#1A1A2E',
    fontWeight: '800',
    fontSize: 17,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  codeInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 6,
  },
  submitBtn: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  cancelText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});