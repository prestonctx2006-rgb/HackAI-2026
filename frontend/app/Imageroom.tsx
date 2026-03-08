import { useState, useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BASE_URL } from '@/constants/api';

export default function ImageRoom() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);

  // UI State & Submission Ref
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const pinRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [uid, setUid] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('uid').then(val => setUid(val));
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${BASE_URL}/game/${code}`);
        const data = await res.json();
        setImageUrl(data.clues?.image ?? null);

        const timerEnd = data.timer_end;
        if (timerEnd) {
          const interval = setInterval(async () => {
            const secondsLeft = Math.max(0, Math.floor((new Date(timerEnd).getTime() - Date.now()) / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft === 0) {
              clearInterval(interval);
              await handleSubmit();
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      } catch (e) {
        console.error('Failed to fetch game:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [code]);

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    const currentUid = uid ?? await AsyncStorage.getItem('uid');
    
    // Using Ref to ensure we don't send 'null' if state is stale
    const finalLat = pinRef.current?.latitude ?? null;
    const finalLng = pinRef.current?.longitude ?? null;

    console.log(`📤 IMAGE PLAYER SUBMITTING: UID: ${currentUid}, Lat: ${finalLat}, Lng: ${finalLng}`);

    try {
      await fetch(`${BASE_URL}/game/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUid,
          lat: finalLat,
          lng: finalLng,
        }),
      });
    } catch (e) {
      console.error('Failed to submit pin:', e);
    }
    router.replace(`/results-screen?code=${code}&uid=${currentUid}`);
  };

  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#FFC832' : '#A78BFA';

  return (
    <ImageBackground
      source={require('@/assets/images/UpdatedRoomBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>IMAGE PLAYER</Text>
          </View>
          <View style={[styles.timerBadge, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          Study this landscape. Look for architecture, vegetation, or road signs!
        </Text>

        <View style={styles.imageCard}>
          <Text style={styles.imageLabel}>YOUR CLUE IMAGE</Text>
          {loading ? (
            <ActivityIndicator color="#A78BFA" style={{ marginVertical: 60 }} />
          ) : imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.clueImage} 
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.emptyText}>No image available</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => setMapVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.mapBtnText}>{pinPlaced ? "Pin Placed ✓" : "Open Map"}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={mapVisible} transparent animationType="slide">
        <View style={styles.mapBackdrop}>
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Place Your Pin 📍</Text>
            <WebView
              style={{ width: '100%', height: 320, borderRadius: 16, marginBottom: 20 }}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #1A1A2E; }</style>
                  </head>
                  <body>
                    <div id="map"></div>
                    <script>
                      var map = L.map('map').setView([20, 0], 2);
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                      var marker;
                      map.on('click', function(e) {
                        if (marker) map.removeLayer(marker);
                        marker = L.marker(e.latlng).addTo(map);
                        window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
                      });
                    </script>
                  </body>
                  </html>
                `
              }}
              onMessage={(e) => {
                const coords = JSON.parse(e.nativeEvent.data);
                const updatedPin = { latitude: coords.lat, longitude: coords.lng };
                setPin(updatedPin);
                pinRef.current = updatedPin;
                console.log("📍 IMAGE PIN UPDATED:", pinRef.current);
              }}
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => { setPinPlaced(true); setMapVisible(false); }}
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  roleBadge: { backgroundColor: 'rgba(167,139,250,0.2)', borderWidth: 1.5, borderColor: '#A78BFA', borderRadius: 50, paddingVertical: 6, paddingHorizontal: 18 },
  roleBadgeText: { color: '#A78BFA', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  timerBadge: { borderWidth: 1.5, borderRadius: 50, paddingVertical: 6, paddingHorizontal: 18, backgroundColor: 'rgba(0,0,0,0.3)' },
  timerText: { fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  instructions: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  imageCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: 16, width: '100%', marginBottom: 28 },
  imageLabel: { color: '#A78BFA', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 12, textAlign: 'center' },
  clueImage: { width: '100%', height: 250, borderRadius: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: 40 },
  mapBtn: { backgroundColor: '#A78BFA', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  mapBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 16 },
  mapBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  mapCard: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44, height: '80%' },
  mapTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  confirmBtn: { backgroundColor: '#FFC832', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 14 },
  confirmBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 16 },
  cancelText: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});