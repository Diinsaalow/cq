import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import SectionCard from '../../components/SectionCard';
import CategorySkeleton from '../../components/CategorySkeleton';
import { fetchCategoryById } from '../services/categoryService';
import { fetchSectionsByCategoryId } from '../services/sectionService';
import { database, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { SectionItem } from '../../types';

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

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [category, setCategory] = useState<any>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category
        const cat = await fetchCategoryById(id as string);
        setCategory(cat);

        // Fetch sections
        const secs = await fetchSectionsByCategoryId(cat.$id);

        // For each section, fetch the actual audio file count
        const formattedSections: SectionItem[] = await Promise.all(
          secs.map(async (section) => {
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
        setSections(formattedSections);
      } catch (err: any) {
        setError(err.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSectionPress = (sectionId: string) => {
    router.push(`/section/${sectionId}`);
  };

  if (loading) {
    return <CategorySkeleton />;
  }

  if (error || !category) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: colors.textDark }}>
          {error || 'Category not found'}
        </Text>
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
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.white,
            borderBottomColor: colors.shadow,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          ]}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          {category.title}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: colors.textDark }]}>
          All Sections
        </Text>
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            item={section}
            onPress={handleSectionPress}
            index={index}
          />
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
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
});
