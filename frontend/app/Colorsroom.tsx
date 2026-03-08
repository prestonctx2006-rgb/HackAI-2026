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
const MOCK_COLORS = ['#009B3A', '#FEDF00', '#002776']; // Brazil flag colors as example
const MOCK_COLOR_NAMES = ['Green', 'Yellow', 'Blue'];
const HAS_MAP = false; // toggle to true if this player has the map this round

export default function ColorsRoom() {
  const [mapVisible, setMapVisible] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);

  return (
    <ImageBackground
      source={require('@/assets/images/RoomBackground1.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>

        {/* Role badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>FLAG COLORS</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          These are the flag colors of the mystery country. Describe them to your teammates!
        </Text>

        {/* Color swatches */}
        <View style={styles.swatchesCard}>
          <Text style={styles.swatchLabel}>FLAG COLORS</Text>
          <View style={styles.swatchRow}>
            {MOCK_COLORS.map((color, index) => (
              <View key={index} style={styles.swatchItem}>
                <View style={[styles.swatch, { backgroundColor: color }]} />
                <Text style={styles.swatchName}>{MOCK_COLOR_NAMES[index]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Map button — only shown if this player has the map */}
        {HAS_MAP && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => setMapVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.mapBtnText}>🗺️ Open Map</Text>
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
    backgroundColor: 'rgba(100,200,255,0.2)',
    borderWidth: 1.5,
    borderColor: '#64C8FF',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  roleBadgeText: {
    color: '#64C8FF',
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
    lineHeight: 22,
  },

  // Color swatches
  swatchesCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 20,
  },
  swatchLabel: {
    color: '#64C8FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  swatchItem: {
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  swatchName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Hint card
  hintCard: {
    backgroundColor: 'rgba(100,200,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(100,200,255,0.3)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 28,
  },
  hintLabel: {
    color: '#64C8FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },

  mapBtn: {
    backgroundColor: '#64C8FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#64C8FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  mapBtnText: {
    color: '#1A1A2E',
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
    backgroundColor: '#64C8FF',
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