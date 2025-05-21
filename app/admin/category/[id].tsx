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
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageFile } from '../../../lib/storage';
import { Category, fetchCategoryById } from '../../services/categoryService';
import {
  Section,
  fetchSectionsByCategoryId,
  addSection,
  deleteSection,
} from '../../services/sectionService';

const { width } = Dimensions.get('window');

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [category, setCategory] = useState<Category | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionImageUri, setNewSectionImageUri] = useState<string | null>(
    null
  );
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCategoryAndSections();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [id]);

  const loadCategoryAndSections = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoryId = typeof id === 'string' ? id : id[0];
      const [categoryData, sectionsData] = await Promise.all([
        fetchCategoryById(categoryId),
        fetchSectionsByCategoryId(categoryId),
      ]);

      setCategory(categoryData);
      setSections(sectionsData);
    } catch (err) {
      console.error('Error loading category data:', err);
      setError('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setShowAddModal(true);
    setNewSectionTitle('');
    setNewSectionImageUri(null);
    setAddError('');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewSectionImageUri(result.assets[0].uri);
    }
  };

  const handleSubmitAddSection = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      const categoryId = typeof id === 'string' ? id : id[0];
      await addSection({
        title: newSectionTitle,
        categoryId: categoryId,
        imageUri: newSectionImageUri,
      });
      setShowAddModal(false);
      loadCategoryAndSections();
    } catch (err: any) {
      console.error('Failed to add section:', err);
      setAddError(err?.message || 'Failed to add section');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSection = (sectionId: string) => {
    Alert.alert('Edit Section', `Edit section ${sectionId}`);
  };

  const handleDeleteSection = (sectionId: string) => {
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section? This will also delete all audio files within it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingSectionId(sectionId);
              await deleteSection(sectionId);
              await loadCategoryAndSections();
              Alert.alert('Success', 'Section deleted successfully');
            } catch (err) {
              console.error('Error deleting section:', err);
              Alert.alert(
                'Error',
                'Failed to delete section. Please try again.'
              );
            } finally {
              setDeletingSectionId(null);
            }
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
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.gradient.end]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color={colors.white} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {category ? category.title : 'Category Details'}
          </Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

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
          <Text style={[styles.errorText, { color: '#ff3333' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadCategoryAndSections}
          >
            <Text style={{ color: colors.white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <ScrollView style={styles.scrollContainer}>
            {/* Category Info Card */}
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
              <Text
                style={[styles.sectionSubtitle, { color: colors.textLight }]}
              >
                Manage sections in this category
              </Text>

              {sections.length === 0 ? (
                <View
                  style={[styles.emptyState, { borderColor: colors.shadow }]}
                >
                  <File size={48} color={colors.textLight} />
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
                    <View key={section.$id} style={styles.sectionItem}>
                      <View style={styles.sectionContent}>
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
                            {' '}
                            {section.title}{' '}
                          </Text>
                          <Text
                            style={[
                              styles.sectionMeta,
                              { color: colors.textLight },
                            ]}
                          >
                            {' '}
                            {section.count || 0} audio files{' '}
                          </Text>
                        </View>
                        <View style={styles.sectionActions}>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { backgroundColor: `${colors.primary}15` },
                            ]}
                            onPress={() => handleEditSection(section.$id)}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { backgroundColor: '#ffebee' },
                              deletingSectionId === section.$id &&
                                styles.actionButtonDisabled,
                            ]}
                            onPress={() => handleDeleteSection(section.$id)}
                            disabled={deletingSectionId === section.$id}
                          >
                            {deletingSectionId === section.$id ? (
                              <ActivityIndicator size="small" color="#d32f2f" />
                            ) : (
                              <Trash size={18} color="#d32f2f" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={handleAddSection}
          >
            <Plus color={colors.white} size={24} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Add Section Modal */}
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
              Add Section
            </Text>
            <Text style={[styles.modalLabel, { color: colors.textLight }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: colors.textDark, borderColor: colors.shadow },
              ]}
              placeholder="Section title"
              placeholderTextColor={colors.textLight}
              value={newSectionTitle}
              onChangeText={setNewSectionTitle}
              autoFocus
            />
            <Text style={[styles.modalLabel, { color: colors.textLight }]}>
              Image
            </Text>
            <TouchableOpacity
              style={[
                styles.imagePickerButton,
                { borderColor: colors.primary },
              ]}
              onPress={handlePickImage}
            >
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {newSectionImageUri ? 'Change Image' : 'Pick Image'}
              </Text>
            </TouchableOpacity>
            {newSectionImageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: newSectionImageUri }}
                  style={styles.imagePreview}
                />
              </View>
            )}
            <Text
              style={[
                styles.modalLabel,
                { color: colors.textLight, marginTop: 12 },
              ]}
            >
              Category ID
            </Text>
            <View
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.lightGray,
                  borderColor: colors.shadow,
                },
              ]}
            >
              <Text style={{ color: colors.textLight }}>
                {typeof id === 'string' ? id : id[0]}
              </Text>
            </View>
            {addError ? (
              <Text style={styles.modalError}>{addError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSubmitAddSection}
                disabled={addLoading}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>
                  {addLoading ? 'Adding...' : 'Add Section'}
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
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
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
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  categoryMeta: {
    flexDirection: 'row',
    marginTop: 20,
  },
  metaItem: {
    marginRight: 32,
  },
  metaValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metaLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginVertical: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  sectionsList: {
    marginTop: 16,
    gap: 16,
  },
  sectionItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    padding: 0,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5e9', // light green for music
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionMeta: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
  imagePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
    marginTop: 4,
  },
});
