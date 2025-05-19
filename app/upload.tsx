import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { logConfig } from '../lib/testConfig';
import {
  ArrowLeft,
  Upload,
  File,
  X,
  Check,
  Music,
  ChevronDown,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getCategoriesWithSections } from '../lib/categories';
import type { CategoryData } from '../types';
import SectionSelector from './components/SectionSelector';
import { formatFileSize } from '../utils/utils';
import { uploadAudioFile } from '../lib/storage';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import OptimizedImage from '../components/OptimizedImage';

// Helper: map backend category/section to local type
const mapCategory = (cat: any) => ({
  id: cat.$id || cat.id,
  title: cat.title,
  sections: (cat.sections || []).map((sec: any) => ({
    id: sec.$id || sec.id,
    title: sec.title,
  })),
});

export default function UploadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [title, setTitle] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log config for debugging
  useEffect(() => {
    logConfig();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const data = await getCategoriesWithSections();
      console.log('Categories with sections', data);
      setCategories(data.map(mapCategory));
    } catch (e) {
      console.error('Error fetching categories:', e);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePickAudio = async () => {
    try {
      setError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
      console.log('File info:', fileInfo);

      // Type guard for fileInfo.size
      const fileSize =
        'size' in fileInfo && typeof fileInfo.size === 'number'
          ? fileInfo.size
          : undefined;

      // Check file size (limit to 50MB for example)
      if (fileSize && fileSize > 50 * 1024 * 1024) {
        setError('File too large. Please select a file smaller than 50MB');
        return;
      }

      setSelectedFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: result.assets[0].mimeType,
        size: fileSize,
      });
    } catch (error) {
      console.error('Error picking audio file:', error);
      setError('Could not select the audio file. Please try again.');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the audio');
      return;
    }

    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    if (!selectedFile) {
      setError('Please select an audio file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      await uploadAudioFile(
        selectedFile.uri,
        selectedFile.name,
        title,
        selectedSection,
        (progress) => {
          console.log('Progress callback received:', progress);
          // Calculate progress percentage based on chunks
          const progressPercentage =
            progress.chunksTotal > 0
              ? Math.round(
                  (progress.chunksUploaded / progress.chunksTotal) * 100
                )
              : Math.round(progress.progress * 100);

          console.log('Upload progress:', {
            chunksUploaded: progress.chunksUploaded,
            chunksTotal: progress.chunksTotal,
            progress: progress.progress,
            calculatedPercentage: progressPercentage,
          });

          setProgress(progressPercentage);
        }
      );
      setUploading(false);
      setProgress(100);
      Alert.alert(
        'Upload Complete',
        'The audio file has been uploaded successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setSelectedSection(null);
              setSelectedFile(null);
              setProgress(0);
              setError(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setError('Failed to upload audio file. Please try again.');
    }
  };

  if (loadingCategories) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState message="Loading categories..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null);
            if (uploading) {
              handleUpload();
            } else {
              fetchCategories();
            }
          }}
        />
      </View>
    );
  }

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
          Upload Audio
        </Text>
      </View>

      {/* Overlay for dropdowns (always rendered above content, but below modals) */}
      {(showCategoryModal || showSectionModal) && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            setShowCategoryModal(false);
            setShowSectionModal(false);
          }}
        />
      )}

      {/* Category Modal (always rendered above overlay) */}
      {showCategoryModal && (
        <View
          style={[
            styles.dropdownModal,
            {
              top: 140,
              backgroundColor: colors.white,
              borderColor: colors.shadow,
            },
          ]}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{ padding: 16 }}
              onPress={() => {
                setSelectedCategory(cat.id);
                setSelectedSection(null);
                setShowCategoryModal(false);
              }}
            >
              <Text style={{ color: colors.textDark }}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text style={{ color: colors.textLight }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section Modal (always rendered above overlay) */}
      {showSectionModal && (
        <View
          style={[
            styles.dropdownModal,
            {
              top: 220,
              backgroundColor: colors.white,
              borderColor: colors.shadow,
            },
          ]}
        >
          {categories
            .find((cat) => cat.id === selectedCategory)
            ?.sections.map((sec) => (
              <TouchableOpacity
                key={sec.id}
                style={{ padding: 16 }}
                onPress={() => {
                  setSelectedSection(sec.id);
                  setShowSectionModal(false);
                }}
              >
                <Text style={{ color: colors.textDark }}>{sec.title}</Text>
              </TouchableOpacity>
            ))}
          <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => setShowSectionModal(false)}
          >
            <Text style={{ color: colors.textLight }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Instructions */}
        <View
          style={[
            styles.instructionContainer,
            { backgroundColor: colors.white },
          ]}
        >
          <Text style={[styles.instructionTitle, { color: colors.textDark }]}>
            Add New Audio File
          </Text>
          <Text style={[styles.instructionText, { color: colors.textLight }]}>
            Upload MP3 files to make them available in your app. Files should be
            in MP3 format for best compatibility.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textDark }]}>
            Audio Title
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                color: colors.textDark,
                borderColor: colors.shadow,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title for the audio"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Category & Section Selection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textDark }]}>
            Category
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                borderColor: colors.shadow,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
            onPress={() => !loadingCategories && setShowCategoryModal(true)}
            disabled={loadingCategories}
          >
            <Text
              style={{
                color: selectedCategory ? colors.textDark : colors.textLight,
              }}
            >
              {loadingCategories
                ? 'Loading...'
                : selectedCategory
                ? categories.find((cat) => cat.id === selectedCategory)?.title
                : 'Select Category'}
            </Text>
            <ChevronDown size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textDark }]}>
            Section
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                backgroundColor: colors.white,
                borderColor: colors.shadow,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: selectedCategory ? 1 : 0.5,
              },
            ]}
            onPress={() => selectedCategory && setShowSectionModal(true)}
            disabled={!selectedCategory}
          >
            <Text
              style={{
                color: selectedSection ? colors.textDark : colors.textLight,
              }}
            >
              {selectedSection
                ? categories
                    .find((cat) => cat.id === selectedCategory)
                    ?.sections.find((sec) => sec.id === selectedSection)?.title
                : 'Select Section'}
            </Text>
            <ChevronDown size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* File Upload Area */}
        <View style={styles.uploadContainer}>
          <Text style={[styles.label, { color: colors.textDark }]}>
            Audio File
          </Text>

          {!selectedFile ? (
            <TouchableOpacity
              style={[
                styles.uploadArea,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.primary,
                },
              ]}
              onPress={handlePickAudio}
            >
              <Upload size={40} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.primary }]}>
                Tap to select an audio file
              </Text>
              <Text style={[styles.uploadSubtext, { color: colors.textLight }]}>
                MP3, WAV or M4A formats supported
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.selectedFileContainer,
                { backgroundColor: colors.white },
              ]}
            >
              <View style={styles.fileInfo}>
                <Music size={24} color={colors.primary} />
                <View style={styles.fileDetails}>
                  <Text
                    style={[styles.fileName, { color: colors.textDark }]}
                    numberOfLines={1}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: colors.textLight }]}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={handleRemoveFile}
                >
                  <X size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.uploadProgress}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.lightGray },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textLight }]}>
              Uploading... {progress}%
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor:
                !title.trim() || !selectedSection || !selectedFile || uploading
                  ? theme === 'dark'
                    ? '#335c3a'
                    : '#b7ddb7'
                  : colors.primary,
              shadowColor:
                !title.trim() || !selectedSection || !selectedFile || uploading
                  ? 'transparent'
                  : theme === 'dark'
                  ? 'transparent'
                  : colors.primary,
            },
          ]}
          onPress={handleUpload}
          disabled={
            !title.trim() || !selectedSection || !selectedFile || uploading
          }
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Upload size={20} color={colors.white} />
              <Text style={[styles.uploadButtonText, { color: colors.white }]}>
                Upload Audio
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  instructionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadArea: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  selectedFileContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 14,
    marginTop: 2,
  },
  removeFileButton: {
    padding: 8,
  },
  uploadProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  uploadButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.01)', // almost transparent
    zIndex: 9,
  },
  dropdownModal: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 11,
    elevation: 12,
    backgroundColor: 'white',
  },
});
