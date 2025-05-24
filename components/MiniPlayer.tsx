import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import { useAudioStore } from '../contexts/audioStore';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useTheme();
  const colors = getColors(theme);
  // Subtle shadow based on theme
  const shadowStyle =
    theme === 'dark'
      ? { shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 }
      : { shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 };
  const {
    isPlaying,
    currentAudio,
    currentSectionId,
    currentAudioIndex,
    pauseSound,
    resumeSound,
    stopSound,
  } = useAudioStore();

  const translateX = useSharedValue(0);
  const isVisible = useSharedValue(true);

  // Check if we're on the section screen
  const isSectionScreen = segments[0] === 'section';

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pauseSound();
    } else {
      await resumeSound();
    }
  };

  const navigateToPlayer = () => {
    router.push({
      pathname: '/player',
      params: { sectionId: currentSectionId, audioIndex: currentAudioIndex },
    });
  };

  const dismissPlayer = async () => {
    await stopSound();
  };

  const gesture = Gesture.Pan()
    .enabled(!isPlaying) // Only allow swipe when audio is paused
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > width * 0.3) {
        // If swiped more than 50% of screen width
        translateX.value = withSpring(event.translationX > 0 ? width : -width);
        isVisible.value = false;
        runOnJS(dismissPlayer)();
      } else {
        // Return to original position
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: isVisible.value ? 1 : 0,
    };
  });

  // If no audio is playing, don't show the mini player
  if (!currentAudio || !currentSectionId) {
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          isSectionScreen ? styles.sectionScreenContainer : null,
          { backgroundColor: colors.white, shadowColor: colors.shadow },
          shadowStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={navigateToPlayer}
          activeOpacity={0.9}
        >
          <Text
            style={[styles.title, { color: colors.textDark }]}
            numberOfLines={1}
          >
            {currentAudio.title}
          </Text>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={20} color={colors.white} />
            ) : (
              <Play size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 0,
    marginBottom: 8,
  },
  sectionScreenContainer: {
    bottom: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  playButton: {
    padding: 8,
    borderRadius: 20,
  },
});
