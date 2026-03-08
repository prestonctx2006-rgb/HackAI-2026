import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';

// Mock data — replace with real API data later
const MOCK_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/1280px-24701-nature-natural-beauty.jpg';
const HAS_MAP = true; // toggle to false if this player doesn't have the map this round

export default function ImageRoom() {
  const [mapVisible, setMapVisible] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

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
          <Text style={styles.roleBadgeText}>🖼️ IMAGE PLAYER</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Study this image and describe what you see to your teammates!
        </Text>

        {/* Image card */}
        <TouchableOpacity
          style={styles.imageCard}
          onPress={() => setImageExpanded(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.imageLabel}>YOUR IMAGE</Text>
          <Image
            source={{ uri: MOCK_IMAGE_URL }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.imageTap}>Tap to expand 🔍</Text>
        </TouchableOpacity>

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

      {/* Expanded image modal */}
      <Modal visible={imageExpanded} transparent animationType="fade">
        <View style={styles.expandedBackdrop}>
          <Image
            source={{ uri: MOCK_IMAGE_URL }}
            style={styles.expandedImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeExpandBtn}
            onPress={() => setImageExpanded(false)}
          >
            <Text style={styles.closeExpandText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
    backgroundColor: 'rgba(160,100,255,0.2)',
    borderWidth: 1.5,
    borderColor: '#A064FF',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  roleBadgeText: {
    color: '#A064FF',
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

  // Image card
  imageCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginBottom: 28,
  },
  imageLabel: {
    color: '#A064FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  imageTap: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
  },

  mapBtn: {
    backgroundColor: '#A064FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#A064FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  mapBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  mapBtnSub: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },

  // Expanded image
  expandedBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '80%',
  },
  closeExpandBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },
  closeExpandText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    backgroundColor: '#A064FF',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  cancelText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
});