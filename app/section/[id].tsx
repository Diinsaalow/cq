import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Play, ArrowLeft } from 'lucide-react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Section, fetchSectionById } from '../services/sectionService';
import { fetchAudioFiles } from '../services/audioService';
import { AudioFile } from '../../types';
import OptimizedImage from '../../components/OptimizedImage';
import ErrorState from '../../components/ErrorState';
import SectionSkeleton from '../../components/SectionSkeleton';

export default function SectionScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [section, setSection] = useState<Section | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSectionData = async () => {
      try {
        setError(null);
        setLoading(true);

        if (!id) {
          throw new Error('Section ID is missing');
        }

        console.log('Loading section with ID:', id);

        // Fetch section details
        const sectionData = await fetchSectionById(id);
        setSection(sectionData);

        // Fetch audio files for this section
        const files = await fetchAudioFiles(id);
        setAudioFiles(files);
      } catch (err: any) {
        console.error('Error loading section data:', err);
        setError(err.message || 'Failed to load section data');
      } finally {
        setLoading(false);
      }
    };

    loadSectionData();
  }, [id]);

  if (loading) {
    return <SectionSkeleton />;
  }

  if (error || !section) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorState message={error || 'Section not found'} />
      </View>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          {section.title}
        </Text>
      </View>

      {/* Audio List */}
      <ScrollView style={styles.audioList} showsVerticalScrollIndicator={false}>
        {audioFiles.length > 0 ? (
          audioFiles.map((audio, index) => (
            <Animated.View
              key={audio.id}
              entering={FadeInDown.delay(index * 100)}
              style={styles.audioItemContainer}
            >
              <TouchableOpacity
                style={[
                  styles.audioItem,
                  { backgroundColor: colors.white, shadowColor: colors.shadow },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/player',
                    params: { sectionId: id, audioIndex: index },
                  })
                }
              >
                <View style={styles.audioInfo}>
                  <Text style={[styles.audioTitle, { color: colors.textDark }]}>
                    {audio.title || `Audio ${index + 1}`}
                  </Text>
                  <Text
                    style={[styles.audioDuration, { color: colors.textLight }]}
                  >
                    {formatTime(audio.duration)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={16} color={colors.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <Text style={[styles.noAudioText, { color: colors.textLight }]}>
            No audio files available in this section
          </Text>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noAudioText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  audioList: {
    flex: 1,
    padding: 20,
  },
  audioItemContainer: {
    marginBottom: 12,
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  audioInfo: {
    flex: 1,
    marginRight: 12,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  audioDuration: {
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 50,
  },
});
