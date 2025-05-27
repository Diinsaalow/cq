import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Play, ArrowLeft, Download } from 'lucide-react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Section, fetchSectionById } from '../services/sectionService';
import { fetchAudioFiles } from '../services/audioService';
import { AudioFile } from '../../types';
import ErrorState from '../../components/ErrorState';
import SectionSkeleton from '../../components/SectionSkeleton';
import { isAudioDownloaded, downloadAudioFile } from '../../utils/cache';

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
  const [downloadingFiles, setDownloadingFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [downloadedFiles, setDownloadedFiles] = useState<{
    [key: string]: boolean;
  }>({});
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: string]: number;
  }>({});

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

        // Check which files are already downloaded
        const downloadedStatus: { [key: string]: boolean } = {};
        for (const file of files) {
          downloadedStatus[file.id] = await isAudioDownloaded(`${file.id}.mp3`);
        }
        setDownloadedFiles(downloadedStatus);
      } catch (err: any) {
        console.error('Error loading section data:', err);
        setError(err.message || 'Failed to load section data');
      } finally {
        setLoading(false);
      }
    };

    loadSectionData();
  }, [id]);

  const handleDownload = async (audio: AudioFile) => {
    try {
      setDownloadingFiles((prev) => ({ ...prev, [audio.id]: true }));
      setDownloadProgress((prev) => ({ ...prev, [audio.id]: 0 }));
      const fileUri = await downloadAudioFile(
        audio.url,
        `${audio.id}.mp3`,
        (progress) => {
          setDownloadProgress((prev) => ({ ...prev, [audio.id]: progress }));
        },
      );
      setDownloadedFiles((prev) => ({ ...prev, [audio.id]: true }));
      // Navigate to player after successful download
      router.push({
        pathname: '/player',
        params: {
          sectionId: id,
          audioIndex: audioFiles.findIndex((f) => f.id === audio.id),
        },
      });
    } catch (err) {
      console.error('Error downloading audio:', err);
      setError('Failed to download audio. Please try again.');
    } finally {
      setDownloadingFiles((prev) => ({ ...prev, [audio.id]: false }));
      setDownloadProgress((prev) => ({ ...prev, [audio.id]: 0 }));
    }
  };

  const handlePlay = (audio: AudioFile, index: number) => {
    router.push({
      pathname: '/player',
      params: { sectionId: id, audioIndex: index },
    });
  };

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
                onPress={() => {
                  if (downloadedFiles[audio.id]) {
                    handlePlay(audio, index);
                  } else {
                    handleDownload(audio);
                  }
                }}
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
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: downloadedFiles[audio.id]
                        ? colors.primary
                        : colors.accent,
                    },
                  ]}
                  onPress={() => {
                    if (downloadedFiles[audio.id]) {
                      handlePlay(audio, index);
                    } else {
                      handleDownload(audio);
                    }
                  }}
                >
                  {downloadingFiles[audio.id] ? (
                    <View style={styles.downloadProgressContainer}>
                      <Text style={styles.downloadProgressText}>
                        {Math.min(
                          100,
                          Math.max(
                            0,
                            Math.round(downloadProgress[audio.id] * 100),
                          ),
                        )}
                        %
                      </Text>
                    </View>
                  ) : downloadedFiles[audio.id] ? (
                    <Play size={16} color={colors.white} />
                  ) : (
                    <Download size={16} color={colors.white} />
                  )}
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
  actionButton: {
    padding: 10,
    borderRadius: 50,
  },
  downloadProgressContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadProgressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
