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

type ModalType = 'login' | 'signup' | null;

export default function LandingScreen() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setUsername('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.detail);
        return;
      }
      closeModal();
      router.replace('/(tabs)/play');
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !password) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.detail);
        return;
      }
      closeModal();
      router.replace('/(tabs)/play');
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

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setActiveModal('login')}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.solidBtn}
          onPress={() => setActiveModal('signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.solidBtnText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.title}>Truth or Terrain</Text>
        <Text style={styles.subtitle}>Going beyond the surface</Text>
      </View>

      {/* ── LOG IN MODAL ── */}
      <Modal visible={activeModal === 'login'} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Welcome back 👋</Text>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="your username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Log In →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── SIGN UP MODAL ── */}
      <Modal visible={activeModal === 'signup'} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create account 🌍</Text>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. globetrotter42"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Create Account →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal}>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  outlineBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  solidBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  solidBtnText: { color: '#1A1A2E', fontWeight: '700', fontSize: 14 },
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
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
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