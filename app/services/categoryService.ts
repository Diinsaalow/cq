import { database, config } from '../../lib/appwrite';
import { Query, Models } from 'react-native-appwrite';

export interface Category extends Models.Document {
  title: string;
  sectionsCount: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories...');
    const response = await database.listDocuments(
      config.db,
      config.col.categories,
      [Query.orderDesc('$createdAt')]
    );

    console.log('Categories response:', response);

    // Fetch sections count for each category
    const categoriesWithSections = await Promise.all(
      response.documents.map(async (category) => {
        console.log('Fetching sections for category:', category.$id);
        const sectionsResponse = await database.listDocuments(
          config.db,
          config.col.sections,
          [Query.equal('categoryId', category.$id)]
        );
        console.log(
          'Sections response for category:',
          category.$id,
          sectionsResponse
        );
        return {
          ...category,
          sectionsCount: sectionsResponse.total,
        };
      })
    );

    console.log('Final categories with sections:', categoriesWithSections);
    return categoriesWithSections as Category[];
  } catch (err) {
    console.error('Error fetching categories:', err);
    throw new Error('Failed to load categories');
  }
};

export const addCategory = async (title: string): Promise<void> => {
  if (!title.trim()) {
    throw new Error('Category title is required');
  }

  try {
    await database.createDocument(
      config.db,
      config.col.categories,
      'unique()',
      {
        title: title.trim(),
      }
    );
  } catch (err) {
    console.error('Error adding category:', err);
    throw new Error('Failed to add category');
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // First, get all sections in this category
    const sectionsResponse = await database.listDocuments(
      config.db,
      config.col.sections,
      [Query.equal('categoryId', categoryId)]
    );

    // Delete all sections and their associated files
    const deletePromises = sectionsResponse.documents.map(async (section) => {
      // Delete section's audio files if any
      if (section.audioFiles && section.audioFiles.length > 0) {
        await Promise.all(
          section.audioFiles.map((fileId: string) =>
            database.deleteDocument(config.db, config.col.audioFiles, fileId)
          )
        );
      }
      // Delete the section
      return database.deleteDocument(
        config.db,
        config.col.sections,
        section.$id
      );
    });

    // Wait for all sections and files to be deleted
    await Promise.all(deletePromises);

    // Finally, delete the category
    await database.deleteDocument(config.db, config.col.categories, categoryId);
  } catch (err) {
    console.error('Error deleting category:', err);
    throw new Error('Failed to delete category');
  }
};

export const fetchCategoryById = async (id: string): Promise<Category> => {
  try {
    const category = await database.getDocument(
      config.db,
      config.col.categories,
      id
    );
    return category as unknown as Category;
  } catch (err) {
    console.error('Error fetching category:', err);
    throw new Error('Failed to load category');
  }
};
