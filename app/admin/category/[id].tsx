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
import { useRouter, useLocalSearchParams } from 'expo-router';
import getColors from '../../../constants/Colors';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ArrowLeft,
  File,
  Plus,
  Edit,
  Trash,
  ChevronRight,
  Music,
} from 'lucide-react-native';
import { database, config } from '../../../lib/appwrite';
import { Query } from 'react-native-appwrite';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [category, setCategory] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryAndSections();
  }, [id]);

  const fetchCategoryAndSections = async () => {
    try {
      setLoading(true);
      // Fetch category details
      const categoryData = await database.getDocument(
        config.db,
        config.col.categories,
        id
      );
      setCategory(categoryData);

      // Fetch sections for this category
      const sectionsData = await database.listDocuments(
        config.db,
        config.col.sections,
        [Query.equal('categoryId', id), Query.orderDesc('$createdAt')]
      );
      setSections(sectionsData.documents);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category data');
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    Alert.alert('Add Section', 'This feature will be implemented soon');
  };

  const handleEditSection = (sectionId) => {
    Alert.alert('Edit Section', `Edit section ${sectionId}`);
  };

  const handleDeleteSection = (sectionId) => {
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section? This will also delete all audio files within it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete logic will be implemented here
            Alert.alert('Delete', `Section ${sectionId} will be deleted`);
          },
        },
      ]
    );
  };

  const handleSectionPress = (sectionId: string) => {
    router.push(`/admin/section/${sectionId}`);
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
          {category ? category.title : 'Category Details'}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddSection}
        >
          <Plus color={colors.white} size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textLight }]}>
            Loading category details...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchCategoryAndSections}
          >
            <Text style={{ color: colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Category Info */}
          <View
            style={[styles.categoryInfo, { backgroundColor: colors.white }]}
          >
            <Text style={[styles.categoryTitle, { color: colors.textDark }]}>
              {category?.title}
            </Text>
            <View style={styles.categoryMeta}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaValue, { color: colors.primary }]}>
                  {sections.length}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textLight }]}>
                  Sections
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaValue, { color: colors.primary }]}>
                  {sections.reduce(
                    (total, section) => total + (section.count || 0),
                    0
                  )}
                </Text>
                <Text style={[styles.metaLabel, { color: colors.textLight }]}>
                  Audio Files
                </Text>
              </View>
            </View>
          </View>

          {/* Sections List */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textDark }]}>
              Sections
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textLight }]}>
              Manage sections in this category
            </Text>

            {sections.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: colors.shadow }]}>
                <File size={40} color={colors.textLight} />
                <Text
                  style={[styles.emptyStateText, { color: colors.textLight }]}
                >
                  No sections found
                </Text>
                <TouchableOpacity
                  style={[
                    styles.emptyStateButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAddSection}
                >
                  <Text style={{ color: colors.white }}>Add Section</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sectionsList}>
                {sections.map((section) => (
                  <View
                    key={section.$id}
                    style={[
                      styles.sectionItem,
                      { backgroundColor: colors.white },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.sectionContent}
                      onPress={() => handleSectionPress(section.$id)}
                    >
                      <View style={styles.sectionIconContainer}>
                        <Music size={24} color={colors.primary} />
                      </View>
                      <View style={styles.sectionDetails}>
                        <Text
                          style={[
                            styles.sectionName,
                            { color: colors.textDark },
                          ]}
                        >
                          {section.title}
                        </Text>
                        <Text
                          style={[
                            styles.sectionMeta,
                            { color: colors.textLight },
                          ]}
                        >
                          {section.count || 0} audio files
                        </Text>
                      </View>
                      <ChevronRight size={20} color={colors.textLight} />
                    </TouchableOpacity>
                    <View style={styles.sectionActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: colors.accent },
                        ]}
                        onPress={() => handleEditSection(section.$id)}
                      >
                        <Edit size={16} color={colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: colors.error },
                        ]}
                        onPress={() => handleDeleteSection(section.$id)}
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
  categoryInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoryMeta: {
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
  sectionsList: {
    marginTop: 16,
  },
  sectionItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionDetails: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionActions: {
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
