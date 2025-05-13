import React, { useEffect, useCallback } from 'react';
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
import Colors from '../constants/Colors';
import { MOCK_DATA } from '../data/mockData';
import { useAudio } from '../contexts/AudioContext';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const { sectionId, audioIndex: audioIndexParam } = useLocalSearchParams();
  const audioIndex = Number(audioIndexParam) || 0;

  // Get audio context
  const {
    isPlaying,
    position,
    duration,
    loading,
    currentAudioIndex,
    currentSectionId,
    playSound,
    pauseSound,
    resumeSound,
    nextTrackRef,
    previousTrackRef,
  } = useAudio();

  // Find the section data
  const section = MOCK_DATA.flatMap((category) => category.sections).find(
    (section) => section.id === sectionId
  );

  const audioFiles = section?.audioFiles || [];

  // Syncing the player screen with the current context state
  useEffect(() => {
    // If this is a new section or the user manually navigated to a different track
    if (
      section &&
      (sectionId !== currentSectionId || audioIndex !== currentAudioIndex)
    ) {
      const audioToPlay = audioFiles[audioIndex];
      if (audioToPlay) {
        playSound(audioToPlay, sectionId as string, audioIndex);
      }
    }
  }, [sectionId, audioIndex]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pauseSound();
    } else {
      await resumeSound();
    }
  };

  const handlePrevious = useCallback(async () => {
    if (currentAudioIndex > 0) {
      const prevAudio = audioFiles[currentAudioIndex - 1];
      if (prevAudio) {
        await playSound(prevAudio, sectionId as string, currentAudioIndex - 1);
      }
    }
  }, [currentAudioIndex, audioFiles, sectionId, playSound]);

  const handleNext = useCallback(async () => {
    if (currentAudioIndex < audioFiles.length - 1) {
      const nextAudio = audioFiles[currentAudioIndex + 1];
      if (nextAudio) {
        await playSound(nextAudio, sectionId as string, currentAudioIndex + 1);
      }
    }
  }, [currentAudioIndex, audioFiles, sectionId, playSound]);

  // Register next/previous handlers
  useEffect(() => {
    if (section) {
      // Set the ref handlers for next/previous
      nextTrackRef.current = handleNext;
      previousTrackRef.current = handlePrevious;
    }

    return () => {
      // Cleanup
      nextTrackRef.current = async () => {};
      previousTrackRef.current = async () => {};
    };
  }, [section, handleNext, handlePrevious, nextTrackRef, previousTrackRef]);

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

  // Current playing audio (based on context state)
  const currentAudio = audioFiles[currentAudioIndex];

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
