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
import Colors from '../../constants/Colors';
import { Search, Play, Pause } from 'lucide-react-native';
import { useAudio } from '../../contexts/AudioContext';
import { MOCK_DATA } from '../../data/mockData';

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { currentAudio, isPlaying, playSound, pauseSound, resumeSound } =
    useAudio();

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
        style={styles.sectionCard}
        onPress={() => handleSectionPress(item.id)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.sectionImage} />
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
          <Text style={styles.sectionCount}>{item.count} lessons</Text>
        </View>
        {firstAudio && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayAudio(firstAudio, item.id, 0)}
          >
            {isCurrentlyPlaying ? (
              <Pause size={16} color={Colors.white} />
            ) : (
              <Play size={16} color={Colors.white} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sections..."
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.textDark,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
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
    color: Colors.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.primary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 12,
  },
});
