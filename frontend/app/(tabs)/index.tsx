import { useState } from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  ImageBackground,
  StatusBar,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

type ModalType = 'login' | 'signup' | null;

export default function HomeScreen() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    // TODO: call backend login API here
    setLoading(false);
    closeModal();
    //router.replace('/Dashboard');
  };

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    // TODO: call backend signup API here
    setLoading(false);
    closeModal();
  };

  return (
    <ImageBackground
      source={require('@/assets/images/Globe1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      {/* Top buttons */}
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

      {/* Center branding */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Truth or Terrain</Text>
        <Text style={styles.subtitle}>Is it the Truth........or is it the Terrain?</Text>
      </View>

      {/* ── LOG IN MODAL ── */}
      <Modal visible={activeModal === 'login'} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Welcome back 👋</Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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

      <View style={styles.navButton}>
        <Button title="Go to Fact Room" onPress={() => router.push('/Factroom')} />
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },

  // Top bar
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
  outlineBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  solidBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  solidBtnText: {
    color: '#1A1A2E',
    fontWeight: '700',
    fontSize: 14,
  },

  // Center branding
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Modal
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
    paddingBottom: 40,
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
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  navButton: {
    padding: 20,
  },
});
