import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  SkipBack,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react-native';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioStore } from '../contexts/audioStore';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import OptimizedImage from '../components/OptimizedImage';
import { cacheAudioFile, preloadAudio } from '../utils/cache';
import { fetchSectionById } from './services/sectionService';
import { fetchAudioFiles } from './services/audioService';
import { AudioFile } from '../types';
import { getImageUrl } from '../utils/utils';
import PlayerSkeleton from '../components/PlayerSkeleton';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sectionId = params.sectionId as string;
  const audioIndexParam = params.audioIndex as string;
  const audioIndex = Number(audioIndexParam) || 0;

  const { theme } = useTheme();
  const colors = getColors(theme);

  // Local state
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<any | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const progressBarRef = useRef<View>(null);

  // Zustand store
  const {
    isPlaying,
    position,
    duration,
    loading,
    currentAudioIndex,
    currentSectionId,
    isSeeking,
    seekPosition,
    playSound,
    pauseSound,
    resumeSound,
    seekTo,
    setIsSeeking,
    setSeekPosition,
    setNextTrackHandler,
    setPreviousTrackHandler,
    error: audioError,
  } = useAudioStore();

  const handleSeek = useCallback(
    (event: GestureResponderEvent) => {
      if (!progressBarRef.current || duration <= 0) return;

      progressBarRef.current.measure((x, y, width, height, pageX, pageY) => {
        const touchX = event.nativeEvent.pageX;
        const relativeX = Math.max(0, Math.min(width, touchX - pageX));
        const seekPercentage = relativeX / width;
        const newPosition = seekPercentage * duration;
        setSeekPosition(newPosition);
      });
    },
    [duration, setSeekPosition]
  );

  // Pan responder for seek functionality
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        setIsSeeking(true);
        handleSeek(event);
      },
      onPanResponderMove: handleSeek,
      onPanResponderRelease: async () => {
        const currentSeekPosition = useAudioStore.getState().seekPosition;
        await seekTo(currentSeekPosition);
        setIsSeeking(false);
      },
    })
  ).current;

  // Load section and audio data
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setIsLoadingData(true);

        if (!sectionId) {
          throw new Error('Section ID is missing');
        }

        console.log('Loading section with ID:', sectionId);

        // Fetch section data
        const sectionData = await fetchSectionById(sectionId);
        setSection(sectionData);

        // Fetch audio files for this section
        const files = await fetchAudioFiles(sectionId);
        setAudioFiles(files);
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load audio data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [sectionId]);

  // Preload next audio file
  useEffect(() => {
    if (audioFiles.length > 0 && currentAudioIndex < audioFiles.length - 1) {
      const nextAudio = audioFiles[currentAudioIndex + 1];
      if (nextAudio?.url) {
        preloadAudio(nextAudio.url);
      }
    }
  }, [currentAudioIndex, audioFiles]);

  // Initialize audio
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        if (isLoadingData || audioFiles.length === 0 || !sectionId) return;

        setError(null);

        // If this is a new section or the user manually navigated to a different track
        if (
          section &&
          (sectionId !== currentSectionId || audioIndex !== currentAudioIndex)
        ) {
          const audioToPlay = audioFiles[audioIndex];
          if (audioToPlay) {
            // Cache the audio file before playing
            const cachedUrl = await cacheAudioFile(
              audioToPlay.url,
              `${audioToPlay.id}.mp3`
            );
            await playSound(
              { ...audioToPlay, url: cachedUrl },
              sectionId,
              audioIndex
            );
          }
        }
      } catch (err) {
        console.error('Error initializing audio:', err);
        setError('Failed to load audio. Please try again.');
      }
    };

    initializeAudio();
  }, [
    sectionId,
    audioIndex,
    audioFiles,
    isLoadingData,
    section,
    currentSectionId,
    currentAudioIndex,
    playSound,
  ]);

  // Track handlers
  const handleNext = useCallback(async () => {
    if (!sectionId || currentAudioIndex >= audioFiles.length - 1) return;

    try {
      setError(null);
      const nextAudio = audioFiles[currentAudioIndex + 1];
      if (nextAudio) {
        const cachedUrl = await cacheAudioFile(
          nextAudio.url,
          `${nextAudio.id}.mp3`
        );
        await playSound(
          { ...nextAudio, url: cachedUrl },
          sectionId,
          currentAudioIndex + 1
        );
      }
    } catch (err) {
      console.error('Error playing next track:', err);
      setError('Failed to play next track. Please try again.');
    }
  }, [currentAudioIndex, audioFiles, sectionId, playSound]);

  const handlePrevious = useCallback(async () => {
    if (!sectionId || currentAudioIndex <= 0) return;

    try {
      setError(null);
      const prevAudio = audioFiles[currentAudioIndex - 1];
      if (prevAudio) {
        const cachedUrl = await cacheAudioFile(
          prevAudio.url,
          `${prevAudio.id}.mp3`
        );
        await playSound(
          { ...prevAudio, url: cachedUrl },
          sectionId,
          currentAudioIndex - 1
        );
      }
    } catch (err) {
      console.error('Error playing previous track:', err);
      setError('Failed to play previous track. Please try again.');
    }
  }, [currentAudioIndex, audioFiles, sectionId, playSound]);

  // Register track handlers
  useEffect(() => {
    if (section && audioFiles.length > 0) {
      setNextTrackHandler(handleNext);
      setPreviousTrackHandler(handlePrevious);
    }

    return () => {
      setNextTrackHandler(null);
      setPreviousTrackHandler(null);
    };
  }, [
    section,
    audioFiles,
    handleNext,
    handlePrevious,
    setNextTrackHandler,
    setPreviousTrackHandler,
  ]);

  const handlePlayPause = async () => {
    try {
      setError(null);
      if (isPlaying) {
        await pauseSound();
      } else {
        await resumeSound();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setError('Failed to control playback. Please try again.');
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoadingData) {
    return <PlayerSkeleton />;
  }

  if (!section || audioFiles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorState message="Section or audio files not found" />
      </View>
    );
  }

  if (error || audioError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorState
          message={error || audioError || 'Unknown error'}
          onRetry={handlePlayPause}
        />
      </View>
    );
  }

  // Current playing audio
  const currentAudio = audioFiles[currentAudioIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.lightGray }]}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.textLight }]}>
            Now Playing
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textDark }]}>
            {section.title}
          </Text>
        </View>
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <OptimizedImage
          source={{ uri: getImageUrl(section.imageUrl) }}
          style={styles.albumArt}
          resizeMode="cover"
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: colors.textDark }]}>
          {currentAudio?.title || `Audio ${currentAudioIndex + 1}`}
        </Text>
        <Text style={[styles.trackSubtitle, { color: colors.textLight }]}>
          {section.title}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          ref={progressBarRef}
          {...panResponder.panHandlers}
          style={[styles.progressBar, { backgroundColor: colors.lightGray }]}
        >
          <View
            style={[
              styles.progress,
              {
                width: `${
                  duration > 0
                    ? ((isSeeking ? seekPosition : position) / duration) * 100
                    : 0
                }%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
          <View
            style={[
              styles.seekHandle,
              {
                left: `${
                  duration > 0
                    ? ((isSeeking ? seekPosition : position) / duration) * 100
                    : 0
                }%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.textLight }]}>
            {formatTime(isSeeking ? seekPosition : position)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textLight }]}>
            {formatTime(duration)}
          </Text>
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
            color={currentAudioIndex === 0 ? colors.textLight : colors.textDark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.playButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={handlePlayPause}
          disabled={loading}
        >
          {isPlaying ? (
            <Pause size={32} color={colors.white} />
          ) : (
            <Play size={32} color={colors.white} />
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
                ? colors.textLight
                : colors.textDark
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  trackSubtitle: {
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 10,
    marginBottom: 8,
    position: 'relative',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  seekHandle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: -5,
    transform: [{ translateX: -8 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
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
    padding: 24,
    borderRadius: 40,
    marginHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
