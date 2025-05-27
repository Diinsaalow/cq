import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Cache keys
const CACHE_KEYS = {
  AUDIO_FILES: 'audio_files',
  CATEGORIES: 'categories',
  SECTIONS: 'sections',
  USER_DATA: 'user_data',
};

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Check if cache is expired
const isCacheExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_EXPIRATION;
};

// Save data to cache
export const saveToCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// Get data from cache
export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(key);
    if (!cachedData) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cachedData);
    if (isCacheExpired(cacheItem.timestamp)) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

// Check network connectivity
export const checkConnectivity = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

// Cache audio file
export const cacheAudioFile = async (
  url: string,
  fileName: string,
): Promise<string> => {
  try {
    const cacheDir = `${FileSystem.cacheDirectory}audio/`;
    const fileUri = `${cacheDir}${fileName}`;

    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    // Check if file is already cached
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    // Download and cache the file
    await FileSystem.downloadAsync(url, fileUri);
    return fileUri;
  } catch (error) {
    console.error('Error caching audio file:', error);
    return url; // Return original URL if caching fails
  }
};

// Clear expired cache
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        const cacheItem = JSON.parse(cachedData);
        if (isCacheExpired(cacheItem.timestamp)) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

// Preload audio file
export const preloadAudio = async (url: string): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    await sound.unloadAsync();
  } catch (error) {
    console.error('Error preloading audio:', error);
  }
};

// Check if audio file is downloaded
export const isAudioDownloaded = async (fileName: string): Promise<boolean> => {
  try {
    const cacheDir = `${FileSystem.cacheDirectory}audio/`;
    const fileUri = `${cacheDir}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists;
  } catch (error) {
    console.error('Error checking if audio is downloaded:', error);
    return false;
  }
};

// Download audio file
export const downloadAudioFile = async (
  url: string,
  fileName: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    const cacheDir = `${FileSystem.cacheDirectory}audio/`;
    const fileUri = `${cacheDir}${fileName}`;

    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    console.log('Starting download from:', url);
    console.log('Saving to:', fileUri);

    let lastBytesWritten = 0;
    let progress = 0;
    let lastProgressUpdate = 0;

    // Download the file with progress tracking
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {
        md5: false,
      },
      (downloadProgress) => {
        const bytesWritten = downloadProgress.totalBytesWritten;
        const bytesDelta = bytesWritten - lastBytesWritten;

        // Only update progress if we've downloaded a significant chunk
        if (bytesDelta > 0) {
          // Calculate progress based on the size of the chunk relative to a reasonable estimate
          // We use 10MB as a base estimate since most audio files are in this range
          const chunkProgress = bytesDelta / (10 * 1024 * 1024);

          // Increment progress by a small amount for each chunk
          progress = Math.min(0.99, progress + chunkProgress);
          lastBytesWritten = bytesWritten;

          // Only update UI if progress has changed by at least 1%
          const progressPercent = Math.floor(progress * 100);
          if (progressPercent > lastProgressUpdate) {
            lastProgressUpdate = progressPercent;
            console.log('Download progress:', {
              bytesWritten,
              bytesDelta,
              progress: progressPercent,
            });

            if (onProgress) {
              onProgress(progress);
            }
          }
        }
      },
    );

    // Start the download
    console.log('Starting download...');
    const downloadResult = await downloadResumable.downloadAsync();
    console.log('Download completed:', downloadResult);

    if (!downloadResult || downloadResult.status !== 200) {
      throw new Error('Download failed');
    }

    // Ensure we send 100% progress at the end
    if (onProgress) {
      onProgress(1);
    }

    return fileUri;
  } catch (error) {
    console.error('Error downloading audio file:', error);
    throw error;
  }
};

export { CACHE_KEYS };
