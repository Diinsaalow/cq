import { database, config } from './appwrite';
import { ID, Query } from 'react-native-appwrite';

// Get all sections
export const getSections = async () => {
  try {
    const sections = await database.listDocuments(
      config.db,
      config.col.sections
    );
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
      config.col.sections,
      sectionId
    );
    return section;
  } catch (error) {
    console.error('Error getting section:', error);
    throw error;
  }
};
