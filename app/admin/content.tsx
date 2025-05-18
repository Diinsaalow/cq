import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
import { Query } from 'react-native-appwrite';

export default function ContentManagementScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await database.listDocuments(
        config.db,
        config.col.categories,
        [Query.orderDesc('$createdAt')]
      );
      setCategories(response.documents);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    Alert.alert('Add Category', 'This feature will be implemented soon');
  };

  const handleEditCategory = (categoryId) => {
    Alert.alert('Edit Category', `Edit category ${categoryId}`);
  };

  const handleDeleteCategory = (categoryId) => {
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

  const handleCategoryPress = (categoryId) => {
    router.push(`/admin/category/${categoryId}`);
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textLight }]}>
            Loading categories...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
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
            <Text style={[styles.sectionSubtitle, { color: colors.textLight }]}>
              Manage your content categories
            </Text>

            {categories.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: colors.shadow }]}>
                <Folder size={40} color={colors.textLight} />
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
                      <View style={styles.categoryIconContainer}>
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
                          {category.sections?.length || 0} sections
                        </Text>
                      </View>
                      <ChevronRight size={20} color={colors.textLight} />
                    </TouchableOpacity>
                    <View style={styles.categoryActions}>
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
                          { backgroundColor: colors.error },
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
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
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
  categoriesList: {
    marginTop: 16,
  },
  categoryItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  categoryActions: {
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
