// lib/storage.ts
import { ID, UploadProgress } from 'react-native-appwrite';
import { config, database, storage } from './appwrite';
import * as FileSystem from 'expo-file-system';
import { Query } from 'react-native-appwrite';
import { Audio } from 'expo-av';

// Bucket IDs
export const AUDIO_BUCKET_ID = config.audio;
export const IMAGE_BUCKET_ID = config.image;

// Log bucket ID for debugging
console.log('=== Storage Configuration ===');
console.log('Audio bucket ID:', AUDIO_BUCKET_ID);
console.log('Image bucket ID:', IMAGE_BUCKET_ID);
console.log('Storage client:', storage);
console.log('===========================');

// Helper to get audio duration in seconds
const getAudioDuration = async (fileUri: string): Promise<number> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    if ('isLoaded' in status && status.isLoaded && status.durationMillis) {
      return status.durationMillis / 1000;
    }
    return 0;
  } catch (e) {
    console.error('Error getting audio duration:', e);
    return 0;
  }
};

// Upload an audio file
export const uploadAudioFile = async (
  fileUri: string,
  fileName: string,
  title: string,
  sectionId: string,
  onProgress?: (progress: UploadProgress) => void
) => {
  try {
    console.log('=== Starting File Upload ===');
    console.log('File URI:', fileUri);
    console.log('File Name:', fileName);
    console.log('Title:', title);
    console.log('Section ID:', sectionId);
    console.log('Bucket ID:', AUDIO_BUCKET_ID);

    // Read the file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('File Info:', fileInfo);

    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Create a file object from the URI
    const file = {
      uri: fileUri,
      name: fileName,
      type: 'audio/mp3', // Adjust based on your file type
      size: fileInfo.size || 0,
    };

    console.log('Prepared file object:', file);

    // Get audio duration
    const duration = await getAudioDuration(fileUri);
    console.log('Audio duration:', duration);

    // 1. Upload the file to the audio bucket
    console.log('Attempting to upload file to bucket...');
    const fileUpload = await storage.createFile(
      AUDIO_BUCKET_ID,
      ID.unique(),
      file,
      undefined, // permissions
      onProgress
    );
    console.log('File upload successful:', fileUpload);

    // 2. Create a database entry linking to this file
    console.log('Creating database entry...');
    const audioRecord = await database.createDocument(
      config.db,
      config.col.audioFiles,
      ID.unique(),
      {
        title: title,
        sectionId: [sectionId], // Wrap sectionId in an array since it's a relationship field
        fileId: fileUpload.$id,
        fileName: fileName,
        fileSize: fileInfo.size,
        uploadedAt: new Date().toISOString(),
        duration,
      }
    );
    console.log('Database entry created:', audioRecord);

    return {
      fileUpload,
      audioRecord,
    };
  } catch (error: any) {
    console.error('=== Upload Error Details ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Bucket ID used:', AUDIO_BUCKET_ID);
    console.error('==========================');
    throw error;
  }
};

// Upload an image file
export const uploadImageFile = async (fileUri: string, fileName: string) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Image file does not exist');
    }
    const file = {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
      size: fileInfo.size || 0,
    };
    const fileUpload = await storage.createFile(
      IMAGE_BUCKET_ID,
      ID.unique(),
      file
    );
    return fileUpload.$id;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

// Get file URL
export const getFileUrl = (fileId: string) => {
  return storage.getFileView(AUDIO_BUCKET_ID, fileId);
};
