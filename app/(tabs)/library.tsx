import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, Play, Pause } from 'lucide-react-native';
import { useAudio } from '../../contexts/AudioContext';
import { MOCK_DATA } from '../../data/mockData';

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentAudio, isPlaying, playSound, pauseSound, resumeSound } =
    useAudio();
  const { theme } = useTheme();
  const colors = getColors(theme);

  // Flatten all sections from all categories
  const allSections = MOCK_DATA.flatMap((category) => category.sections);

  // Filter sections based on search query
  const filteredSections = allSections.filter((section) =>
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

  const renderSectionItem = ({ item }: { item: any }) => {
    // Get first audio file if available
    const firstAudio =
      item.audioFiles && item.audioFiles.length > 0 ? item.audioFiles[0] : null;
    const isCurrentlyPlaying = currentAudio?.id === firstAudio?.id && isPlaying;

    return (
      <TouchableOpacity
        style={[
          styles.sectionCard,
          { backgroundColor: colors.white, shadowColor: colors.shadow },
        ]}
        onPress={() => handleSectionPress(item.id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.sectionImage} />
        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
            {item.title}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textLight }]}>
            {item.subtitle}
          </Text>
          <Text style={[styles.sectionCount, { color: colors.primary }]}>
            {item.count} lessons
          </Text>
        </View>
        {firstAudio && (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={() => handlePlayAudio(firstAudio, item.id, 0)}
          >
            {isCurrentlyPlaying ? (
              <Pause size={16} color={colors.white} />
            ) : (
              <Play size={16} color={colors.white} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

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
});
