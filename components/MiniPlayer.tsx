import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import { useAudio } from '../contexts/AudioContext';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function MiniPlayer() {
  const router = useRouter();
  const {
    isPlaying,
    currentAudio,
    currentSectionId,
    currentAudioIndex,
    pauseSound,
    resumeSound,
  } = useAudio();

  // If no audio is playing, don't show the mini player
  if (!currentAudio || !currentSectionId) {
    return null;
  }

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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={navigateToPlayer}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {currentAudio.title}
        </Text>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {isPlaying ? (
            <Pause size={20} color={Colors.white} />
          ) : (
            <Play size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  playButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
