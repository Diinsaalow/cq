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
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
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
  RefreshCw,
  AlertTriangle,
} from 'lucide-react-native';
import {
  Category,
  fetchCategories,
  addCategory,
  deleteCategory,
} from '../services/categoryService';

export default function ContentManagementScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const fadeAnim = new Animated.Value(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCategories();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
    setNewCategoryTitle('');
    setAddError('');
  };

  const handleSubmitAddCategory = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      await addCategory(newCategoryTitle);
      setShowAddModal(false);
      loadCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setAddError(
        err instanceof Error ? err.message : 'Failed to add category'
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    Alert.alert('Edit Category', `Edit category ${categoryId}`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also delete all sections and audio files within it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingCategoryId(categoryId);
              await deleteCategory(categoryId);
              await loadCategories();
              Alert.alert(
                'Success',
                'Category and all its contents have been deleted successfully.'
              );
            } catch (err) {
              console.error('Error deleting category:', err);
              Alert.alert(
                'Error',
                'Failed to delete category. Please try again.'
              );
            } finally {
              setDeletingCategoryId(null);
            }
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
        <Animated.View
          key={i}
          style={[
            styles.skeletonItem,
            { backgroundColor: colors.lightGray },
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            },
          ]}
        >
          <View
            style={[styles.skeletonIcon, { backgroundColor: colors.shadow }]}
          />
          <View style={styles.skeletonContent}>
            <View
              style={[styles.skeletonTitle, { backgroundColor: colors.shadow }]}
            />
            <View
              style={[
                styles.skeletonSubtitle,
                { backgroundColor: colors.shadow },
              ]}
            />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: `${colors.textDark}10` },
          ]}
          onPress={() => router.back()}
        >
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textDark }]}>
          Manage Content
        </Text>
        <View style={styles.headerRight} />
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
              onPress={loadCategories}
            >
              <RefreshCw size={16} color={colors.white} />
              <Text style={{ color: colors.white, fontWeight: '600' }}>
                Retry
              </Text>
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
                    <Text style={{ color: colors.white, fontWeight: '600' }}>
                      Add Category
                    </Text>
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
                              styles.categorySubtitle,
                              { color: colors.textLight },
                            ]}
                          >
                            {category.sectionsCount} sections
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.categoryActions}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: `${colors.primary}15` },
                          ]}
                          onPress={() => handleEditCategory(category.$id)}
                        >
                          <Edit size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: `${colors.accent}15` },
                            deletingCategoryId === category.$id &&
                              styles.actionButtonDisabled,
                          ]}
                          onPress={() => handleDeleteCategory(category.$id)}
                          disabled={deletingCategoryId === category.$id}
                        >
                          {deletingCategoryId === category.$id ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.accent}
                            />
                          ) : (
                            <Trash size={18} color={colors.accent} />
                          )}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddCategory}
      >
        <Plus color={colors.white} size={24} />
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContainer, { backgroundColor: colors.white }]}
          >
            <Text style={[styles.modalTitle, { color: colors.textDark }]}>
              Add Category
            </Text>
            <Text style={[styles.modalLabel, { color: colors.textLight }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: colors.textDark, borderColor: colors.shadow },
              ]}
              placeholder="Category title"
              placeholderTextColor={colors.textLight}
              value={newCategoryTitle}
              onChangeText={setNewCategoryTitle}
              autoFocus
            />
            {addError ? (
              <Text style={styles.modalError}>{addError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSubmitAddCategory}
                disabled={addLoading}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>
                  {addLoading ? 'Adding...' : 'Add Category'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                onPress={() => setShowAddModal(false)}
                disabled={addLoading}
              >
                <Text style={{ color: colors.white }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.7,
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonItem: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitle: {
    height: 20,
    width: '60%',
    borderRadius: 4,
  },
  skeletonSubtitle: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  categorySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalError: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});
