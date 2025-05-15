import React, { useState } from 'react';
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
import Colors from '../constants/Colors';
import { ArrowLeft, Upload, File, X, Check, Music } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function UploadScreen() {
  const router = useRouter();
  const { username } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Mock categories and sections data
  const categories = [
    {
      id: 'cat1',
      title: 'Category 1',
      sections: [
        { id: 'sec1', title: 'Section 1' },
        { id: 'sec2', title: 'Section 2' },
      ],
    },
    {
      id: 'cat2',
      title: 'Category 2',
      sections: [
        { id: 'sec3', title: 'Section 3' },
        { id: 'sec4', title: 'Section 4' },
      ],
    },
    {
      id: 'cat3',
      title: 'Category 3',
      sections: [{ id: 'sec5', title: 'Section 5' }],
    },
  ];

  const handlePickAudio = async () => {
    try {
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
        Alert.alert('File too large', 'Please select a file smaller than 50MB');
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
      Alert.alert('Error', 'Could not select the audio file');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for the audio');
      return;
    }

    if (!selectedSection) {
      Alert.alert('Missing Information', 'Please select a section');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Missing File', 'Please select an audio file to upload');
      return;
    }

    // Simulate upload
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Simulate completion
          setTimeout(() => {
            setUploading(false);
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
                  },
                },
              ]
            );
          }, 500);
        }
        return newProgress;
      });
    }, 300);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Audio</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>Add New Audio File</Text>
          <Text style={styles.instructionText}>
            Upload MP3 files to make them available in your app. Files should be
            in MP3 format for best compatibility.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Audio Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title for the audio"
          />
        </View>

        {/* Category & Section Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select Section</Text>
          <View style={styles.sectionCard}>
            {categories.map((category, catIdx) => (
              <View key={category.id}>
                <Text style={styles.sectionCategory}>{category.title}</Text>
                {category.sections.map((section) => (
                  <TouchableOpacity
                    key={section.id}
                    style={[
                      styles.sectionRadioRow,
                      selectedSection === section.id &&
                        styles.sectionRadioRowSelected,
                    ]}
                    onPress={() => setSelectedSection(section.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selectedSection === section.id &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selectedSection === section.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text style={styles.sectionRadioText}>{section.title}</Text>
                  </TouchableOpacity>
                ))}
                {catIdx !== categories.length - 1 && (
                  <View style={styles.sectionDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* File Upload Area */}
        <View style={styles.uploadContainer}>
          <Text style={styles.label}>Audio File</Text>

          {!selectedFile ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handlePickAudio}
            >
              <Upload size={40} color={Colors.primary} />
              <Text style={styles.uploadText}>Tap to select an audio file</Text>
              <Text style={styles.uploadSubtext}>
                MP3, WAV or M4A formats supported
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileContainer}>
              <View style={styles.fileInfo}>
                <Music size={24} color={Colors.primary} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={handleRemoveFile}
                >
                  <X size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Progress Bar (only shown when uploading) */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% Uploaded</Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!title.trim() || !selectedSection || !selectedFile || uploading) &&
              styles.disabledButton,
          ]}
          onPress={handleUpload}
          disabled={
            !title.trim() || !selectedSection || !selectedFile || uploading
          }
        >
          {uploading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Upload size={20} color={Colors.white} />
              <Text style={styles.uploadButtonText}>Upload Audio</Text>
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  instructionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionOption: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSectionOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionOptionText: {
    fontSize: 14,
    color: Colors.textDark,
    marginRight: 8,
  },
  selectedSectionOptionText: {
    color: Colors.white,
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  selectedFileContainer: {
    backgroundColor: Colors.white,
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
    color: Colors.textDark,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  removeFileButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'right',
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: Colors.primary + '80', // 50% opacity
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionCategory: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 10,
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  sectionRadioRowSelected: {
    backgroundColor: '#f0fdf4',
  },
  sectionRadioText: {
    fontSize: 15,
    color: Colors.textDark,
    marginLeft: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 8,
    borderRadius: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
