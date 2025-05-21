export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

import { storage, config } from '../lib/appwrite';

export const getImageUrl = (imageId?: string) => {
  if (!imageId) return 'https://via.placeholder.com/300';
  try {
    return storage.getFileView(config.image, imageId).toString();
  } catch (error) {
    console.error('Error getting image URL:', error);
    return 'https://via.placeholder.com/300';
  }
};
