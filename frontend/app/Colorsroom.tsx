import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BASE_URL } from '@/constants/api';

const COLOR_NAME_MAP: Record<string, string> = {
  red: '#e63946', blue: '#457b9d', white: '#f1faee', green: '#2d6a4f',
  yellow: '#f4d35e', black: '#1d1d1d', orange: '#f77f00', purple: '#7b2d8b',
  gold: '#ffd700', silver: '#c0c0c0', brown: '#8b4513', pink: '#ff69b4',
  cyan: '#00b4d8', teal: '#008080', gray: '#808080', grey: '#808080',
  navy: '#001f5b', maroon: '#800000', olive: '#808000', lime: '#00ff00',
  indigo: '#4b0082', violet: '#ee82ee', beige: '#f5f5dc', turquoise: '#40e0d0',
  'light blue': '#add8e6', 'dark blue': '#00008b',
  'light green': '#90ee90', 'dark green': '#006400',
  'light red': '#ff6b6b', 'dark red': '#8b0000',
  'light yellow': '#ffffe0', 'dark yellow': '#ffd700',
  'light purple': '#dda0dd', 'dark purple': '#4b0082',
  'light pink': '#ffb6c1', 'dark pink': '#ff1493',
  'light gray': '#d3d3d3', 'dark gray': '#a9a9a9',
  'light grey': '#d3d3d3', 'dark grey': '#a9a9a9',
  'light orange': '#ffd580', 'dark orange': '#ff8c00',
};

export default function ColorsRoom() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [uid, setUid] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Map States
  const [mapVisible, setMapVisible] = useState(false);
  const [pinPlaced, setPinPlaced] = useState(false);
  
  // Use state for UI feedback and useRef for reliable submission data
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const pinRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('uid').then(val => setUid(val));
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${BASE_URL}/game/${code}`);
        const data = await res.json();
        const flag = data.clues?.flag;

        if (typeof flag === 'string') {
          const parsed = flag.split(',').map((c: string) => c.trim().replace(/"/g, ''));
          setColors(parsed);
        } else if (Array.isArray(flag)) {
          setColors(flag.map((c: string) => c.trim().replace(/"/g, '')));
        }

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
    
    // CRITICAL: Pull from pinRef to avoid "null" submission issue
    const finalLat = pinRef.current?.latitude ?? null;
    const finalLng = pinRef.current?.longitude ?? null;

    console.log(`📤 COLORS PLAYER SUBMITTING: UID: ${currentUid}, Lat: ${finalLat}, Lng: ${finalLng}`);

    try {
      await fetch(`${BASE_URL}/game/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            uid: currentUid, 
            lat: finalLat, 
            lng: finalLng 
        }),
      });
    } catch (e) {
      console.error('Failed to submit:', e);
    }
    router.replace(`/results-screen?code=${code}&uid=${currentUid}`);
  };

  const resolveColor = (c: string): string => {
    if (!c) return '#888888';
    const lower = c.trim().toLowerCase();
    if (lower.startsWith('#') || lower.startsWith('rgb')) return c;
    return COLOR_NAME_MAP[lower] ?? '#888888';
  };

  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 30 ? '#FFC832' : '#64C8FF';

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
            <Text style={styles.roleBadgeText}>FLAG COLORS</Text>
          </View>
          <View style={[styles.timerBadge, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          These are the flag colors of the mystery country. Describe them to your teammates and place your guess!
        </Text>

        <View style={styles.swatchesCard}>
          <Text style={styles.swatchLabel}>FLAG COLORS</Text>
          {loading ? (
            <ActivityIndicator color="#64C8FF" />
          ) : colors.length === 0 ? (
            <Text style={styles.emptyText}>No colors available</Text>
          ) : (
            <View style={styles.swatchRow}>
              {colors.map((color, index) => {
                const resolved = resolveColor(color);
                return (
                  <View key={index} style={styles.swatchItem}>
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: resolved },
                        resolved === '#f1faee' || resolved === '#ffd700' || resolved === '#ffffe0'
                          ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }
                          : null,
                      ]}
                    />
                    <Text style={styles.swatchName}>
                      {color.trim().charAt(0).toUpperCase() + color.trim().slice(1).toLowerCase()}
                    </Text>
                  </View>
                );
              })}
            </View>
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

      {/* Map Modal */}
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
                pinRef.current = updatedPin; // Update Ref
                console.log("📍 COLORS PIN UPDATED:", pinRef.current);
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
  roleBadge: { backgroundColor: 'rgba(100,200,255,0.2)', borderWidth: 1.5, borderColor: '#64C8FF', borderRadius: 50, paddingVertical: 6, paddingHorizontal: 18 },
  roleBadgeText: { color: '#64C8FF', fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  timerBadge: { borderWidth: 1.5, borderRadius: 50, paddingVertical: 6, paddingHorizontal: 18, backgroundColor: 'rgba(0,0,0,0.3)' },
  timerText: { fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  instructions: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 28 },
  swatchesCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: 24, width: '100%', marginBottom: 20 },
  swatchLabel: { color: '#64C8FF', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 16 },
  swatchItem: { alignItems: 'center', gap: 8 },
  swatch: { width: 64, height: 64, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  swatchName: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginVertical: 12 },
  mapBtn: { backgroundColor: '#64C8FF', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  mapBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 16 },
  mapBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  mapCard: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 44, height: '80%' },
  mapTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  confirmBtn: { backgroundColor: '#64C8FF', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 14 },
  confirmBtnText: { color: '#1A1A2E', fontWeight: '800', fontSize: 16 },
  cancelText: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 },
});