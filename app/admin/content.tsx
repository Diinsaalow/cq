import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ArrowLeft,
  Folder,
  File,
  Plus,
  Edit,
  Trash,
  ChevronRight,
} from 'lucide-react-native';
import { database, config } from '../../lib/appwrite';
import { Query, Models } from 'react-native-appwrite';

interface Category extends Models.Document {
  title: string;
  sectionsCount: number;
}

export default function ContentManagementScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const fadeAnim = new Animated.Value(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state

      console.log('Fetching categories...');
      const response = await database.listDocuments(
        config.db,
        config.col.categories,
        [Query.orderDesc('$createdAt')]
      );

      console.log('Categories response:', response);

      // Fetch sections count for each category
      const categoriesWithSections = await Promise.all(
        response.documents.map(async (category) => {
          console.log('Fetching sections for category:', category.$id);
          const sectionsResponse = await database.listDocuments(
            config.db,
            config.col.sections,
            [Query.equal('categoryId', category.$id)]
          );
          console.log(
            'Sections response for category:',
            category.$id,
            sectionsResponse
          );
          return {
            ...category,
            sectionsCount: sectionsResponse.total,
          };
        })
      );

      console.log('Final categories with sections:', categoriesWithSections);
      setCategories(categoriesWithSections as Category[]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    Alert.alert('Add Category', 'This feature will be implemented soon');
  };

  const handleEditCategory = (categoryId: string) => {
    Alert.alert('Edit Category', `Edit category ${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also delete all sections and audio files within it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete logic will be implemented here
            Alert.alert('Delete', `Category ${categoryId} will be deleted`);
          },
        },
      ]
    );
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/admin/category/${categoryId}`);
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.skeletonItem, { backgroundColor: colors.lightGray }]}
        >
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonContent}>
            <View
              style={[
                styles.skeletonTitle,
                { backgroundColor: colors.lightGray },
              ]}
            />
            <View
              style={[
                styles.skeletonSubtitle,
                { backgroundColor: colors.lightGray },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

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
          Manage Content
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCategory}
        >
          <Plus color={colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.textDark }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={fetchCategories}
            >
              <Text style={{ color: colors.white }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
                Categories
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: colors.textLight }]}
              >
                Manage your content categories
              </Text>

              {categories.length === 0 ? (
                <View
                  style={[styles.emptyState, { borderColor: colors.shadow }]}
                >
                  <Folder size={48} color={colors.primary} />
                  <Text
                    style={[styles.emptyStateText, { color: colors.textLight }]}
                  >
                    No categories found
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.emptyStateButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAddCategory}
                  >
                    <Text style={{ color: colors.white }}>Add Category</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.categoriesList}>
                  {categories.map((category) => (
                    <View
                      key={category.$id}
                      style={[
                        styles.categoryItem,
                        { backgroundColor: colors.white },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.categoryContent}
                        onPress={() => handleCategoryPress(category.$id)}
                      >
                        <View
                          style={[
                            styles.categoryIconContainer,
                            { backgroundColor: `${colors.primary}15` },
                          ]}
                        >
                          <Folder size={24} color={colors.primary} />
                        </View>
                        <View style={styles.categoryDetails}>
                          <Text
                            style={[
                              styles.categoryTitle,
                              { color: colors.textDark },
                            ]}
                          >
                            {category.title}
                          </Text>
                          <Text
                            style={[
                              styles.categoryMeta,
                              { color: colors.textLight },
                            ]}
                          >
                            {category.sectionsCount} sections
                          </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textLight} />
                      </TouchableOpacity>
                      <View
                        style={[
                          styles.categoryActions,
                          { borderTopColor: colors.shadow },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: colors.accent },
                          ]}
                          onPress={() => handleEditCategory(category.$id)}
                        >
                          <Edit size={16} color={colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: '#EF4444' },
                          ]}
                          onPress={() => handleDeleteCategory(category.$id)}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    width: '40%',
    borderRadius: 4,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginVertical: 24,
  },
  emptyStateText: {
    fontSize: 16,
    marginVertical: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesList: {
    marginTop: 16,
  },
  categoryItem: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 14,
  },
  categoryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
