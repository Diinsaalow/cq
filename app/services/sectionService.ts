import { database, config } from '../../lib/appwrite';
import { Query, Models } from 'react-native-appwrite';
import { uploadImageFile } from '../../lib/storage';

export interface Section extends Models.Document {
  title: string;
  categoryId: string;
  count?: number;
  imageUrl?: string;
  audioFiles?: string[];
}

export const fetchSectionsByCategoryId = async (
  categoryId: string
): Promise<Section[]> => {
  try {
    const response = await database.listDocuments(
      config.db,
      config.col.sections,
      [Query.equal('categoryId', categoryId)]
    );
    return response.documents as Section[];
  } catch (err) {
    console.error('Error fetching sections:', err);
    throw new Error('Failed to load sections');
  }
};

export const addSection = async ({
  title,
  categoryId,
  imageUri,
}: {
  title: string;
  categoryId: string;
  imageUri?: string | null;
}): Promise<Section> => {
  if (!title.trim()) {
    throw new Error('Section title is required');
  }

  try {
    let imageUrl = null;
    if (imageUri) {
      const fileName = imageUri.split('/').pop() || 'image.jpg';
      imageUrl = await uploadImageFile(imageUri, fileName);
    }

    const section = await database.createDocument(
      config.db,
      config.col.sections,
      'unique()',
      {
        title: title.trim(),
        categoryId,
        imageUrl,
        audioFiles: [],
      }
    );

    return section as Section;
  } catch (err) {
    console.error('Error adding section:', err);
    throw new Error('Failed to add section');
  }
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  try {
    // Get the section first to check for audio files
    const section = (await database.getDocument(
      config.db,
      config.col.sections,
      sectionId
    )) as Section;

    // Delete associated audio files if any
    if (section.audioFiles && section.audioFiles.length > 0) {
      await Promise.all(
        section.audioFiles.map((fileId: string) =>
          database.deleteDocument(config.db, config.col.audioFiles, fileId)
        )
      );
    }

    // Delete the section
    await database.deleteDocument(config.db, config.col.sections, sectionId);
  } catch (err) {
    console.error('Error deleting section:', err);
    throw new Error('Failed to delete section');
  }
};
