import { database, config } from './appwrite';
import { ID, Query } from 'react-native-appwrite';

// Create a default section if none exists
export const createDefaultSection = async () => {
  try {
    // Check if any sections exist
    const sections = await database.listDocuments(config.db, 'sections', [
      Query.limit(1),
    ]);

    if (sections.documents.length === 0) {
      // Create default section
      const defaultSection = await database.createDocument(
        config.db,
        'sections',
        ID.unique(),
        {
          title: 'Default Section',
          description: 'Default section for audio files',
          order: 0,
          createdAt: new Date().toISOString(),
        }
      );
      return defaultSection;
    }

    return sections.documents[0];
  } catch (error) {
    console.error('Error creating default section:', error);
    throw error;
  }
};

// Get all sections
export const getSections = async () => {
  try {
    const sections = await database.listDocuments(config.db, 'sections', [
      Query.orderAsc('order'),
    ]);
    return sections.documents;
  } catch (error) {
    console.error('Error getting sections:', error);
    throw error;
  }
};

// Get section by ID
export const getSectionById = async (sectionId: string) => {
  try {
    const section = await database.getDocument(
      config.db,
      'sections',
      sectionId
    );
    return section;
  } catch (error) {
    console.error('Error getting section:', error);
    throw error;
  }
};
