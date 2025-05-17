// lib/storage.ts
import { Storage } from 'react-native-appwrite';
import { client, config, database } from './appwrite';
import { ID, UploadProgress } from 'react-native-appwrite';
import * as FileSystem from 'expo-file-system';
import { Query } from 'react-native-appwrite';

// Initialize Storage
export const storage = new Storage(client);

// Bucket IDs
export const AUDIO_BUCKET_ID = 'audio_files';

// Upload an audio file
export const uploadAudioFile = async (
  fileUri: string,
  fileName: string,
  title: string,
  sectionId?: string,
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
      type: 'audio/mpeg', // Adjust based on your file type
      size: fileInfo.size || 0,
    };

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
      'audioFiles',
      ID.unique(),
      {
        title: title,
        sectionId: sectionId || 'uncategorized',
        fileId: fileUpload.$id,
        fileName: fileName,
        fileSize: fileInfo.size,
        uploadedAt: new Date().toISOString(),
        duration: 0,
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

// Delete audio file
export const deleteAudioFile = async (fileId: string) => {
  try {
    // Delete from storage
    await storage.deleteFile(AUDIO_BUCKET_ID, fileId);

    // Delete from database
    const audioFiles = await database.listDocuments(config.db, 'audioFiles', [
      Query.equal('fileId', fileId),
    ]);

    if (audioFiles.documents.length > 0) {
      await database.deleteDocument(
        config.db,
        'audioFiles',
        audioFiles.documents[0].$id
      );
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
    throw error;
  }
};
