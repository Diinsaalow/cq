import { database, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';

export interface AdminStats {
  categoriesCount: number;
  sectionsCount: number;
  audioFilesCount: number;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    // Fetch categories count
    const categoriesResponse = await database.listDocuments(
      config.db,
      config.col.categories,
    );

    // Fetch sections count
    const sectionsResponse = await database.listDocuments(
      config.db,
      config.col.sections,
    );

    // Fetch audio files count
    const audioFilesResponse = await database.listDocuments(
      config.db,
      config.col.audioFiles,
    );

    return {
      categoriesCount: categoriesResponse.total,
      sectionsCount: sectionsResponse.total,
      audioFilesCount: audioFilesResponse.total,
    };
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    throw new Error('Failed to load admin statistics');
  }
};
