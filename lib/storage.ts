// lib/storage.ts
import { Storage } from 'react-native-appwrite';
import { client, config, database } from './appwrite';
import { ID } from 'react-native-appwrite';

// Initialize Storage
export const storage = new Storage(client);

// Define bucket IDs
export const AUDIO_BUCKET_ID = 'audio-lessons'; 
export const IMAGES_BUCKET_ID = 'images';

// Upload an audio file
export const uploadAudioFile = async (file: any, title: string, sectionId: string) => {
  try {
    // 1. Upload the file to the audio bucket
    const fileUpload = await storage.createFile(
      AUDIO_BUCKET_ID,
      ID.unique(),
      file
    );
    
    // 2. Create a database entry linking to this file
    const audioRecord = await database.createDocument(
      config.db,
      'audioFiles',
      ID.unique(),
      {
        title: title,
        sectionId: sectionId,
        fileId: fileUpload.$id,  // Store the bucket file ID
        // Other metadata
      }
    );
    
    return audioRecord;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
};

// Get an audio file URL for streaming
export const getAudioFileUrl = (fileId: string) => {
  return storage.getFileView(AUDIO_BUCKET_ID, fileId);
};