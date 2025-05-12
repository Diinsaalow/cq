import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Play, ArrowLeft } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { MOCK_DATA } from '../../data/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SectionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find the section data
  const section = MOCK_DATA.flatMap(category => 
    category.sections).find(section => section.id === id);

  if (!section) {
    return (
      <View style={styles.container}>
        <Text>Section not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{section.title}</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Image 
          source={{ uri: section.imageUrl }} 
          style={styles.heroImage}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{section.title}</Text>
          <Text style={styles.heroSubtitle}>{section.subtitle}</Text>
          <TouchableOpacity style={styles.playAllButton}>
            <Play color={Colors.white} size={20} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio List */}
      <ScrollView 
        style={styles.audioList}
        showsVerticalScrollIndicator={false}
      >
        {Array.from({ length: section.count }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 100)}
            style={styles.audioItemContainer}
          >
            <TouchableOpacity style={styles.audioItem}>
              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>Audio {index + 1}</Text>
                <Text style={styles.audioDuration}>3:45</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Play size={16} color={Colors.white} />
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
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
    color: Colors.textDark,
  },
  hero: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.shadow,
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
    color: Colors.textDark,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 20,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playAllText: {
    color: Colors.white,
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
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
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
    color: Colors.textDark,
    marginBottom: 4,
  },
  audioDuration: {
    fontSize: 14,
    color: Colors.textLight,
  },
  playButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});