import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import CategorySection from '../../components/CategorySection';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchCategories } from '../services/categoryService';
import { fetchSectionsByCategoryId } from '../services/sectionService';
import { database, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { CategoryData, SectionItem } from '../../types';
import ErrorState from '../../components/ErrorState';
import SkeletonCategorySection from '../../components/HomeSkeleton';

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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and their sections
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories
        const categoriesData = await fetchCategories();

        // For each category, fetch its sections
        const categoriesWithSections = await Promise.all(
          categoriesData.map(async (category) => {
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
                  imageUrl:
                    section.imageUrl || 'https://via.placeholder.com/300',
                };
              })
            );

            return {
              id: category.$id,
              title: category.title,
              sections: formattedSections,
            };
          })
        );

        setCategories(categoriesWithSections);
      } catch (err: any) {
        console.error('Error loading home data:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSectionPress = useCallback(
    (id: string) => {
      router.push(`/section/${id}`);
    },
    [router]
  );

  const handleSeeMorePress = useCallback(
    (categoryId: string) => {
      router.push(`/category/${categoryId}`);
    },
    [router]
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Diinsaalow" />
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3].map((index) => (
            <SkeletonCategorySection key={index} colors={colors} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Diinsaalow" />
        <ErrorState
          message={error}
          onRetry={() => setLoading(true)}
          retryText="Try Again"
        />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Diinsaalow" />
        <View style={styles.centerContent}>
          <Text style={[styles.emptyText, { color: colors.textDark }]}>
            No categories found. Please add categories in the admin panel.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Diinsaalow" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            data={category}
            onSectionPress={handleSectionPress}
            onSeeMorePress={handleSeeMorePress}
            home
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
