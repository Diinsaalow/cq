import { database, config } from './appwrite';
import { ID, Query } from 'react-native-appwrite';

// Get all categories
export const getCategories = async () => {
  const categories = await database.listDocuments(
    config.db,
    config.col.categories,
    [Query.orderAsc('order')]
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
      config.col.categories,
      [Query.orderAsc('order')]
    );

    // Get all sections
    const sections = await database.listDocuments(
      config.db,
      config.col.sections,
      [Query.orderAsc('order')]
    );

    console.log('section one', sections.documents[0].categoryId.$id);

    // Organize sections by category
    const categoriesWithSections = categories.documents.map((category) => ({
      ...category,
      sections: sections.documents.filter(
        (section) => section.categoryId.$id === category.$id
      ),
    }));
    return categoriesWithSections;
  } catch (error) {
    console.error('Error getting categories with sections:', error);
    throw error;
  }
};

// // Get sections for a specific category
// export const getSectionsByCategory = async (categoryId: string) => {
//   try {
//     const sections = await database.listDocuments(
//       config.db,
//       config.col.sections,
//       [Query.equal('categoryId', categoryId.), Query.orderAsc('order')]
//     );
//     return sections.documents;
//   } catch (error) {
//     console.error('Error getting sections by category:', error);
//     throw error;
//   }
// };