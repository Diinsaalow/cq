import { database, config, storage } from '../../lib/appwrite';
import { Query, Models } from 'react-native-appwrite';
import { AudioFile } from '../../types';

// Get all audio files for a section
export const fetchAudioFiles = async (
  sectionId: string | undefined
): Promise<AudioFile[]> => {
  try {
    // Validate sectionId
    if (!sectionId) {
      throw new Error('Section ID is required to fetch audio files');
    }

    console.log('Fetching audio files for section:', sectionId);
    const response = await database.listDocuments(
      config.db,
      config.col.audioFiles,
      [Query.equal('sectionId', sectionId), Query.orderAsc('$createdAt')]
    );

    console.log(`Found ${response.total} audio files for section ${sectionId}`);

    // Transform the data to match our AudioFile type
    const audioFiles: AudioFile[] = response.documents.map((doc) => {
      const file = doc as unknown as {
        $id: string;
        title: string;
        fileId: string;
        fileName: string;
        fileSize: number;
        duration: number;
        uploadedAt: string;
        sectionId: string;
      };

      // Try getFileView first. If you still get playback errors, switch to getFileDownload below.
      let fileUrl = storage.getFileView(config.audio, file.fileId);
      // let fileUrl = storage.getFileDownload(config.audio, file.fileId); // Uncomment if getFileView doesn't work
      console.log('Audio file URL:', fileUrl.toString());

      return {
        id: file.$id,
        title: file.title,
        duration: file.duration,
        url: fileUrl.toString(),
        fileId: file.fileId,
      };
    });

    return audioFiles;
  } catch (err) {
    console.error('Error fetching audio files:', err);
    throw new Error('Failed to load audio files');
  }
};

// Get a single audio file by ID
export const fetchAudioFileById = async (
  audioId: string | undefined
): Promise<AudioFile> => {
  try {
    // Validate audioId
    if (!audioId) {
      throw new Error('Audio ID is required');
    }

    console.log('Fetching audio file with ID:', audioId);
    const document = await database.getDocument(
      config.db,
      config.col.audioFiles,
      audioId
    );

    const file = document as unknown as {
      $id: string;
      title: string;
      fileId: string;
      fileName: string;
      fileSize: number;
      duration: number;
      uploadedAt: string;
      sectionId: string;
    };

    // Try getFileView first. If you still get playback errors, switch to getFileDownload below.
    let fileUrl = storage.getFileView(config.audio, file.fileId);
    // let fileUrl = storage.getFileDownload(config.audio, file.fileId); // Uncomment if getFileView doesn't work
    console.log('Audio file URL:', fileUrl.toString());

    return {
      id: file.$id,
      title: file.title,
      duration: file.duration,
      url: fileUrl.toString(),
      fileId: file.fileId,
    };
  } catch (err) {
    console.error('Error fetching audio file by ID:', err);
    throw new Error('Failed to load audio file');
  }
};

// Delete an audio file
export const deleteAudio = async (audioId: string): Promise<void> => {
  try {
    // Validate audioId
    if (!audioId) {
      throw new Error('Audio ID is required to delete audio file');
    }

    console.log('Deleting audio file with ID:', audioId);

    // First get the audio file details to delete the file from storage
    const audioDoc = await database.getDocument(
      config.db,
      config.col.audioFiles,
      audioId
    );

    const file = audioDoc as unknown as {
      fileId: string;
    };

    // Delete the file from storage if it exists
    if (file.fileId) {
      console.log('Deleting file from storage:', file.fileId);
      await storage.deleteFile(config.audio, file.fileId);
    }

    // Delete the document from database
    console.log('Deleting document from database:', audioId);
    await database.deleteDocument(config.db, config.col.audioFiles, audioId);

    console.log('Successfully deleted audio file:', audioId);
  } catch (err) {
    console.error('Error deleting audio file:', err);
    throw new Error('Failed to delete audio file');
  }
};
