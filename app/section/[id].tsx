import React from 'react';
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
import { MOCK_DATA } from '../../data/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SectionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  // Find the section data
  const section = MOCK_DATA.flatMap((category) => category.sections).find(
    (section) => section.id === id
  );

  if (!section) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textDark }}>Section not found</Text>
      </View>
    );
  }

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

      {/* Hero Section */}
      {/* <View style={[styles.hero, { backgroundColor: colors.white, shadowColor: colors.shadow }]}> 
        <Image 
          source={{ uri: section.imageUrl }} 
          style={styles.heroImage}
        />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.textDark }]}>{section.title}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textLight }]}>{section.subtitle}</Text>
          <TouchableOpacity style={[styles.playAllButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}> 
            <Play color={colors.white} size={20} />
            <Text style={[styles.playAllText, { color: colors.white }]}>Play All</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Audio List */}
      <ScrollView style={styles.audioList} showsVerticalScrollIndicator={false}>
        {Array.from({ length: section.count }).map((_, index) => (
          <Animated.View
            key={index}
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
                  Audio {index + 1}
                </Text>
                <Text
                  style={[styles.audioDuration, { color: colors.textLight }]}
                >
                  3:45
                </Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Play size={16} color={colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        ))}
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
  hero: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playAllText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
