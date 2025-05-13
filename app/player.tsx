import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Volume2,
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import Colors from '../constants/Colors';
import { MOCK_DATA } from '../data/mockData';
import { AudioFile } from '../types';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const { sectionId, audioIndex: audioIndexParam } = useLocalSearchParams();
  const audioIndex = Number(audioIndexParam) || 0;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(audioIndex);

  // Find the section data
  const section = MOCK_DATA.flatMap((category) => category.sections).find(
    (section) => section.id === sectionId
  );

  const audioFiles = section?.audioFiles || [];
  const currentAudio = audioFiles[currentAudioIndex];

  // Function to update playback status
  const updatePlaybackStatus = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setPosition(status.positionMillis / 1000);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Unload sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Load audio whenever currentAudioIndex changes
    loadAudio();

    // Update playback status every second
    const interval = setInterval(updatePlaybackStatus, 1000);
    return () => clearInterval(interval);
  }, [currentAudioIndex]);

  const loadAudio = async () => {
    if (!currentAudio) return;

    // Unload previous sound if it exists
    if (sound) {
      await sound.unloadAsync();
    }

    setLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentAudio.url },
        { shouldPlay: isPlaying },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      // Set up audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handlePrevious = () => {
    if (currentAudioIndex > 0) {
      setCurrentAudioIndex(currentAudioIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentAudioIndex < audioFiles.length - 1) {
      setCurrentAudioIndex(currentAudioIndex + 1);
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!section) {
    return (
      <View style={styles.container}>
        <Text>Section not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.textDark} size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <Text style={styles.headerSubtitle}>{section.title}</Text>
        </View>
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <Image source={{ uri: section.imageUrl }} style={styles.albumArt} />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>
          {currentAudio?.title || `Audio ${currentAudioIndex + 1}`}
        </Text>
        <Text style={styles.trackSubtitle}>{section.title}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${duration > 0 ? (position / duration) * 100 : 0}%` },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePrevious}
          disabled={currentAudioIndex === 0}
        >
          <SkipBack
            size={32}
            color={currentAudioIndex === 0 ? Colors.textLight : Colors.textDark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={loading}
        >
          {isPlaying ? (
            <Pause size={32} color={Colors.white} />
          ) : (
            <Play size={32} color={Colors.white} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleNext}
          disabled={currentAudioIndex === audioFiles.length - 1}
        >
          <SkipForward
            size={32}
            color={
              currentAudioIndex === audioFiles.length - 1
                ? Colors.textLight
                : Colors.textDark
            }
          />
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      {/* <View style={styles.volumeContainer}>
        <Volume2 size={20} color={Colors.textLight} />
        <View style={styles.volumeBar}>
          <View style={styles.volumeLevel} />
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  trackSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    marginBottom: 8,
  },
  progress: {
    width: '30%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    backgroundColor: Colors.primary,
    padding: 24,
    borderRadius: 40,
    marginHorizontal: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  volumeBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginLeft: 12,
  },
  volumeLevel: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
