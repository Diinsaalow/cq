// lib/storage.ts
import { Storage } from 'react-native-appwrite';
import { client, config, database } from './appwrite';
import { ID, UploadProgress } from 'react-native-appwrite';
import * as FileSystem from 'expo-file-system';
import { Query } from 'react-native-appwrite';
import { Audio } from 'expo-av';

// Initialize Storage
export const storage = new Storage(client);

// Bucket IDs
export const AUDIO_BUCKET_ID = config.audio;

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
    // Read the file
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
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

    // Get audio duration
    const duration = await getAudioDuration(fileUri);

    // 1. Upload the file to the audio bucket
    const fileUpload = await storage.createFile(
      AUDIO_BUCKET_ID,
      ID.unique(),
      file,
      undefined, // permissions
      onProgress
    );

    // 2. Create a database entry linking to this file
    const audioRecord = await database.createDocument(
      config.db,
      config.col.audioFiles,
      ID.unique(),
      {
        title: title,
        sectionId: sectionId,
        fileId: fileUpload.$id,
        fileName: fileName,
        fileSize: fileInfo.size,
        uploadedAt: new Date().toISOString(),
        duration,
      }
    );

    return {
      fileUpload,
      audioRecord,
    };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
};

// Get file URL
export const getFileUrl = (fileId: string) => {
  return storage.getFileView(AUDIO_BUCKET_ID, fileId);
};
