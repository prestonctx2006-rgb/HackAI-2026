import { Audio } from 'expo-av';
import { BASE_URL } from './constants/api';

export const playHintAudio = async (gameCode: string) => {
  try {
    // fetch audio from backend
    const res = await fetch(`${BASE_URL}/hint-audio/${gameCode}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // play directly from base64 URI
    const soundUri = `data:audio/mp3;base64,${data.audio}`;

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
    await sound.playAsync();

    return { phrase: data.phrase, country: data.country };
  } catch (e) {
    console.error('Audio hint error:', e);
    throw e;
  }
};