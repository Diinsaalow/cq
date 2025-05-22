import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Play, Pause } from 'lucide-react-native';
import { useAudio } from '../../contexts/AudioContext';
import { fetchCategories } from '../services/categoryService';
import { fetchSectionsByCategoryId } from '../services/sectionService';
import { database, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { SectionItem } from '../../types';
import ErrorState from '../../components/ErrorState';
import OptimizedImage from '../../components/OptimizedImage';
import { getImageUrl } from '../../utils/utils';
import LibrarySkeleton from '../../components/LibrarySkeleton';

async function getAudioFileCount(sectionId: string): Promise<number> {
  try {
    const response = await database.listDocuments(
      config.db,
      config.col.audioFiles,
      [Query.equal('sectionId', sectionId)]
    );
    return response.total;
  } catch (err) {
    console.error('Error fetching audio file count:', err);
    return 0;
  }
}

const SectionImage = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <OptimizedImage
      source={{ uri: getImageUrl(imageUrl) }}
      style={styles.sectionImage}
      resizeMode="cover"
    />
  );
};

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentAudio, isPlaying, playSound, pauseSound, resumeSound } =
    useAudio();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const loadData = async () => {
    try {
      setError(null);

      // Fetch all categories
      const categoriesData = await fetchCategories();

      // For each category, fetch its sections
      const allSections = await Promise.all(
        categoriesData.flatMap(async (category) => {
          const sections = await fetchSectionsByCategoryId(category.$id);

          // For each section, fetch the actual audio file count
          const formattedSections: SectionItem[] = await Promise.all(
            sections.map(async (section) => {
              const audioCount = await getAudioFileCount(section.$id);
              return {
                id: section.$id,
                title: section.title,
                subtitle: `${audioCount} audio files`,
                count: audioCount,
                imageUrl: section.imageUrl || 'https://via.placeholder.com/300',
              };
            })
          );

          return formattedSections;
        })
      );

      // Flatten the array of sections
      setSections(allSections.flat());
    } catch (err: any) {
      console.error('Error loading library data:', err);
      setError(err.message || 'Failed to load sections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, []);

  // Filter sections based on search query
  const filteredSections = sections.filter((section) =>
    searchQuery
      ? section.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleSectionPress = (sectionId: string) => {
    router.push(`/section/${sectionId}`);
  };

  const handlePlayAudio = async (
    audio: any,
    sectionId: string,
    index: number
  ) => {
    if (currentAudio?.id === audio.id) {
      isPlaying ? pauseSound() : resumeSound();
    } else {
      await playSound(audio, sectionId, index);
    }
  };

  const renderSectionItem = ({ item }: { item: SectionItem }) => {
    const isCurrentlyPlaying = currentAudio?.id === item.id && isPlaying;

    return (
      <TouchableOpacity
        style={[
          styles.sectionCard,
          { backgroundColor: colors.white, shadowColor: colors.shadow },
        ]}
        onPress={() => handleSectionPress(item.id)}
      >
        <SectionImage imageUrl={item.imageUrl} />
        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
            {item.title}
          </Text>

          <Text style={[styles.sectionCount, { color: colors.primary }]}>
            {item.count} audio files
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={() => handlePlayAudio(item, item.id, 0)}
        >
          {isCurrentlyPlaying ? (
            <Pause size={16} color={colors.white} />
          ) : (
            <Play size={16} color={colors.white} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <LibrarySkeleton />;
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            { backgroundColor: colors.white, borderBottomColor: colors.shadow },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.textDark }]}>
            Your Library
          </Text>
        </View>
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            loadData();
          }}
          retryText="Try Again"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.white, borderBottomColor: colors.shadow },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          Your Library
        </Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.white, borderColor: colors.shadow },
        ]}
      >
        <Search size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textDark }]}
          placeholder="Search sections..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSections}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title="Pull to refresh"
            titleColor={colors.textLight}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text style={[styles.emptyText, { color: colors.textDark }]}>
              No sections found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  sectionCount: {},
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
