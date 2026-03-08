import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';

// Mock data — replace with real API data later
const MOCK_FACT = "This country is home to the world's largest rainforest.";
const MOCK_CITY = "Manaus";
const HAS_MAP = true; // toggle to false if this player doesn't have the map this round

export default function FactRoom() {
  const [mapVisible, setMapVisible] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);

  return (
    <ImageBackground
      source={require('@/assets/images/UpdatedRoomBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Role badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>FACT PLAYER</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Read this fact carefully and guide your teammates!
        </Text>

        {/* Fact card */}
        <View style={styles.factCard}>
          <Text style={styles.factLabel}>YOUR FACT</Text>
          <Text style={styles.factText}>{MOCK_FACT}</Text>
        </View>

        {/* Map button — only shown if this player has the map */}
        {HAS_MAP && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => setMapVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.mapBtnText}>Open Map</Text>
            {pinPlaced && <Text style={styles.mapBtnSub}>Pin placed ✓</Text>}
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Map Modal */}
      <Modal visible={mapVisible} transparent animationType="slide">
        <View style={styles.mapBackdrop}>
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Place Your Pin 📍</Text>
            <Text style={styles.mapSubtitle}>
              Tap the location you think matches the clues
            </Text>

            {/* Map placeholder — replace with real map component */}
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>🌍</Text>
              <Text style={styles.mapPlaceholderSub}>Map goes here</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                setPinPlaced(true);
                setMapVisible(false);
              }}
            >
              <Text style={styles.confirmBtnText}>Confirm Pin →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMapVisible(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  roleBadge: {
    backgroundColor: 'rgba(143,94,66,0.22)',
    borderWidth: 1.5,
    borderColor: '#8f5e42',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  roleBadgeText: {
    color: 'rgb(235, 222, 203)',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2,
  },

  instructions: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.3,
  },

  factCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 28,
  },
  factLabel: {
    color: '#8f5e42',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  factText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },

  mapBtn: {
    backgroundColor: '#8f5e42',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  mapBtnText: {
    color: 'rgb(235, 222, 203)',
    fontWeight: '800',
    fontSize: 16,
  },
  mapBtnSub: {
    color: '#1A1A2E',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },

  // Map modal
  mapBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mapCard: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 44,
  },
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  mapSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 20,
  },
  mapPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapPlaceholderText: { fontSize: 48 },
  mapPlaceholderSub: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    fontSize: 13,
  },
  confirmBtn: {
    backgroundColor: '#FFC832',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmBtnText: {
    color: '#1A1A2E',
    fontWeight: '800',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});
