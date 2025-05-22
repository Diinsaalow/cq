import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import getColors from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ArrowLeft,
  Music,
  Plus,
  Edit,
  Trash,
  Play,
  Pause,
} from 'lucide-react-native';
import { database, config, storage } from '../../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { formatFileSize } from '../../../utils/utils';

// Define types based on your Appwrite structure
interface SectionDoc {
  $id: string;
  title: string;
  categoryId: string[]; // Relationship is always an array
  imageUrl?: string;
}

interface AudioDoc {
  $id: string;
  title: string;
  sectionId: string[]; // Relationship is always an array
  fileId: string;
  fileName: string;
  fileSize: number;
  duration: number;
  uploadedAt: string;
}

export default function SectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [section, setSection] = useState<SectionDoc | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSectionAndAudioFiles();
  }, [id]);

  const fetchSectionAndAudioFiles = async () => {
    try {
      setLoading(true);
      // Fetch section details
      const sectionData = await database.getDocument(
        config.db,
        config.col.sections,
        typeof id === 'string' ? id : id[0]
      );
      setSection(sectionData as unknown as SectionDoc);

      // Fetch audio files for this section
      const filesData = await database.listDocuments(
        config.db,
        config.col.audioFiles,
        [
          Query.equal('sectionId', [typeof id === 'string' ? id : id[0]]),
          Query.orderDesc('$createdAt'),
        ]
      );
      setAudioFiles(filesData.documents as unknown as AudioDoc[]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching section data:', err);
      setError('Failed to load section data' as any);
      setLoading(false);
    }
  };

  const handleAddAudio = () => {
    router.push('/upload');
  };

  const handleEditAudio = (audioId: string) => {
    Alert.alert('Edit Audio', `Edit audio ${audioId}`);
  };

  const handleDeleteAudio = (audioId: string) => {
    Alert.alert(
      'Delete Audio',
      'Are you sure you want to delete this audio file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete logic will be implemented here
            Alert.alert('Delete', `Audio ${audioId} will be deleted`);
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          {section ? section.title : 'Section Details'}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddAudio}
        >
          <Plus color={colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textLight }]}>
            Loading section details...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#ff3b30' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchSectionAndAudioFiles}
          >
            <Text style={{ color: colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Section Info */}
          <View style={[styles.sectionInfo, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
              {section?.title}
            </Text>
            <View style={styles.sectionMeta}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaValue, { color: colors.primary }]}>
                  {audioFiles.length}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textLight }]}>
                  Audio Files
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaValue, { color: colors.primary }]}>
                  {formatDuration(
                    audioFiles.reduce(
                      (total, audio) => total + (audio.duration || 0),
                      0
                    )
                  )}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textLight }]}>
                  Total Duration
                </Text>
              </View>
            </View>
          </View>

          {/* Audio Files List */}
          <View style={styles.audioContainer}>
            <Text style={[styles.audioListTitle, { color: colors.textDark }]}>
              Audio Files
            </Text>
            <Text
              style={[styles.audioListSubtitle, { color: colors.textLight }]}
            >
              Manage audio files in this section
            </Text>

            {audioFiles.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: colors.shadow }]}>
                <Music size={40} color={colors.textLight} />
                <Text
                  style={[styles.emptyStateText, { color: colors.textLight }]}
                >
                  No audio files found
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyStateButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddAudio}
                >
                  <Text style={{ color: colors.white }}>Upload Audio</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.audioList}>
                {audioFiles.map((audio, index) => (
                  <View
                    key={audio.$id}
                    style={[
                      styles.audioItem,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.audioContent}
                      onPress={() =>
                        router.push({
                          pathname: '/player',
                          params: { sectionId: id, audioIndex: index + 1 },
                        })
                      }
                    >
                      <View
                        style={[
                          styles.audioIconContainer,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Play size={20} color={colors.white} />
                      </View>
                      <View style={styles.audioDetails}>
                        <Text
                          style={[
                            styles.audioTitle,
                            { color: colors.textDark },
                          ]}
                        >
                          {audio.title}
                        </Text>
                        <View style={styles.audioMeta}>
                          <Text
                            style={[
                              styles.audioDuration,
                              { color: colors.textLight },
                            ]}
                          >
                            {formatDuration(audio.duration)}
                          </Text>
                          <Text
                            style={[
                              styles.audioSize,
                              { color: colors.textLight },
                            ]}
                          >
                            {formatFileSize(audio.fileSize)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.audioActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: colors.accent },
                        ]}
                        onPress={() => handleEditAudio(audio.$id)}
                      >
                        <Edit size={16} color={colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: '#ff3b30' },
                        ]}
                        onPress={() => handleDeleteAudio(audio.$id)}
                      >
                        <Trash size={16} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sectionInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionMeta: {
    flexDirection: 'row',
    marginTop: 16,
  },
  metaItem: {
    marginRight: 24,
  },
  metaValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metaLabel: {
    fontSize: 14,
  },
  audioContainer: {
    padding: 16,
  },
  audioListTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  audioListSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyStateText: {
    fontSize: 16,
    marginVertical: 12,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  audioList: {
    marginTop: 16,
  },
  audioItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  audioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioDetails: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  audioMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  audioDuration: {
    fontSize: 14,
    marginRight: 12,
  },
  audioSize: {
    fontSize: 14,
  },
  audioActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
