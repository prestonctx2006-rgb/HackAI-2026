import { useEffect, useState, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BASE_URL } from '@/constants/api';

type Submission = {
  uid: string;
  username?: string; // Added username field
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  points: number;
};

type Results = {
  city: string;
  country: string;
  real_lat: number;
  real_lng: number;
  image_is_fake: boolean;
  flag_is_fake: boolean;
  fact_is_fake: boolean;
  submissions: Submission[];
  winner_uid: string;
};

export default function ResultsScreen() {
  const { code, uid } = useLocalSearchParams<{ code: string; uid: string }>();
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/game/${code}/results`);
      const data = await res.json();
      setResults(data);
      
      // OPTIONAL: If we expect 3 players but only have 1 or 2, 
      // check again in 2 seconds to catch the laggards.
      if (data.submissions && data.submissions.length < 3) {
        setTimeout(fetchResults, 2000);
      }
    } catch (e) {
      console.error('Failed to fetch results:', e);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getLieLabel = () => {
    if (!results) return '';
    if (results.image_is_fake) return '🖼️ The Image was the lie!';
    if (results.flag_is_fake) return '🏳️ The Flag Colors were the lie!';
    if (results.fact_is_fake) return '📝 The Fact was the lie!';
    return 'No lie this round';
  };

  const mySubmission = results?.submissions.find(s => s.uid === uid);

  const buildMapHtml = () => {
    if (!results) return '';
    const { real_lat, real_lng, submissions } = results;

    const markerJs = submissions
      .filter(s => s.lat !== null && s.lng !== null)
      .map((s) => {
        const isMe = s.uid === uid;
        const color = isMe ? '#2A82CB' : '#E63946'; 
        // Use username if available, otherwise fall back to Player ID
        const displayName = s.username || `Player ${s.uid.substring(0, 4)}`;
        
        return `
          L.circleMarker([${s.lat}, ${s.lng}], {
            color: '${color}', fillColor: '${color}', fillOpacity: 0.8, radius: 8
          }).addTo(map).bindPopup('<b>${displayName}</b>');
        `;
      }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #1A1A2E; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${real_lat}, ${real_lng}], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([${real_lat}, ${real_lng}]).addTo(map).bindPopup('Correct Location').openPopup();
          ${markerJs}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <ImageBackground
      source={require('@/assets/images/UpdatedRoomBackground.png')}
      style={styles.background}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Round Results</Text>
          <Text style={styles.subtitle}>
            {results ? `${results.city}, ${results.country}` : 'Calculating...'}
          </Text>
        </View>

        {loading && !results ? (
          <ActivityIndicator color="#FFC832" size="large" style={{ marginTop: 40 }} />
        ) : results ? (
          <>
            <View style={styles.lieCard}>
              <Text style={styles.lieLabel}>THE ROUND REVEAL</Text>
              <Text style={styles.lieText}>{getLieLabel()}</Text>
            </View>

            <View style={styles.mapCard}>
              <WebView
                style={{ width: '100%', height: 250, borderRadius: 12 }}
                originWhitelist={['*']}
                source={{ html: buildMapHtml() }}
              />
            </View>

            <View style={styles.leaderboardCard}>
              <Text style={styles.leaderboardLabel}>LEADERBOARD</Text>
              {[...results.submissions]
                .sort((a, b) => b.points - a.points)
                .map((s, i) => (
                  <View key={s.uid} style={[styles.leaderboardRow, s.uid === uid && styles.leaderboardRowHighlight]}>
                    <Text style={styles.leaderboardRank}>#{i + 1}</Text>
                    <View style={styles.leaderboardInfo}>
                      <Text style={styles.leaderboardUid}>
                        {s.username || `Player ${s.uid.substring(0, 4)}`}
                        {s.uid === results.winner_uid ? ' 🥇' : ''}
                        {s.uid === uid ? ' (You)' : ''}
                      </Text>
                      <Text style={styles.leaderboardDistance}>
                        {s.distance_km ? `${s.distance_km.toFixed(0)} km` : 'No Guess'}
                      </Text>
                    </View>
                    <Text style={styles.leaderboardPoints}>{s.points}</Text>
                  </View>
                ))}
            </View>

            <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
              <Text style={styles.homeBtnText}>Play Again</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { color: '#FFC832', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'white', opacity: 0.7 },
  lieCard: { backgroundColor: 'rgba(255,200,50,0.1)', borderWidth: 1, borderColor: '#FFC832', borderRadius: 15, padding: 15, width: '100%', marginBottom: 15, alignItems: 'center' },
  lieLabel: { color: '#FFC832', fontSize: 10, fontWeight: '800' },
  lieText: { color: 'white', fontSize: 16, fontWeight: '700' },
  mapCard: { width: '100%', marginBottom: 15, borderRadius: 15, overflow: 'hidden' },
  leaderboardCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 15, width: '100%' },
  leaderboardLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', marginBottom: 10 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 5 },
  leaderboardRowHighlight: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
  leaderboardRank: { color: '#FFC832', fontSize: 14, fontWeight: '800', width: 25 },
  leaderboardInfo: { flex: 1 },
  leaderboardUid: { color: 'white', fontSize: 14, fontWeight: '700' },
  leaderboardDistance: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  leaderboardPoints: { color: '#FFC832', fontSize: 16, fontWeight: '800' },
  homeBtn: { backgroundColor: '#FFC832', borderRadius: 12, paddingVertical: 15, paddingHorizontal: 40, marginTop: 20 },
  homeBtnText: { color: '#1A1A2E', fontWeight: '800' },
});