import { Client, Databases, Account, Storage } from 'react-native-appwrite';
import { Platform } from 'react-native';

const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
  db: process.env.EXPO_PUBLIC_APPWRITE_DB_ID || '',
  col: {
    users: process.env.EXPO_PUBLIC_APPWRITE_COL_USERS_ID || '',
    categories: process.env.EXPO_PUBLIC_APPWRITE_COL_CATEGORIES_ID || '',
    sections: process.env.EXPO_PUBLIC_APPWRITE_COL_SECTIONS_ID || '',
    audioFiles: process.env.EXPO_PUBLIC_APPWRITE_AUDIO_COL_ID || '',
  },
  audio: process.env.EXPO_PUBLIC_APPWRITE_AUDIO_BUCKET_ID || '',
};

// Detailed debug logging
console.log('=== Appwrite Configuration ===');
console.log('Endpoint:', config.endpoint);
console.log('Project ID:', config.projectId);
console.log('Database ID:', config.db);
console.log('Collections:');
console.log('  - Users:', config.col.users);
console.log('  - Categories:', config.col.categories);
console.log('  - Sections:', config.col.sections);
console.log('  - Audio Files:', config.col.audioFiles);
console.log('Audio Bucket ID:', config.audio);
console.log('Platform:', Platform.OS);
console.log('===========================');

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

switch (Platform.OS) {
  case 'ios':
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_ID || '');
    break;
  case 'android':
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME || '');
    break;
}

const database = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export { database, config, client, account, storage };
