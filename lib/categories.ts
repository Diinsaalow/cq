import { database, config } from './appwrite';
import { Query } from 'react-native-appwrite';

// Get all categories
export const getCategories = async () => {
  const categories = await database.listDocuments(
    config.db,
    config.col.categories
  );

  console.log('All categories', categories);
  return categories.documents;
};

// Get all categories with their sections
export const getCategoriesWithSections = async () => {
  try {
    // Get all categories
    const categories = await database.listDocuments(
      config.db,
      config.col.categories
    );

    // Get all sections
    const sections = await database.listDocuments(
      config.db,
      config.col.sections
    );

    // Organize sections by category
    const categoriesWithSections = categories.documents.map((category) => ({
      ...category,
      sections: sections.documents.filter((section) => {
        // Handle different possible formats of categoryId
        if (typeof section.categoryId === 'string') {
          return section.categoryId === category.$id;
        } else if (section.categoryId && section.categoryId.$id) {
          return section.categoryId.$id === category.$id;
        } else if (Array.isArray(section.categoryId)) {
          return section.categoryId.includes(category.$id);
        }
        return false;
      }),
    }));
    return categoriesWithSections;
  } catch (error) {
    console.error('Error getting categories with sections:', error);
    throw error;
  }
};
