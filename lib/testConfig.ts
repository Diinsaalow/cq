// Test file to check environment variables
import { config } from './appwrite';

export function logConfig() {
  console.log('Appwrite Config:');
  console.log('Endpoint:', config.endpoint);
  console.log('Project ID:', config.projectId);
  console.log('Database ID:', config.db);
  console.log('Collections:');
  console.log('  - Users:', config.col.users);
  console.log('  - Categories:', config.col.categories);
  console.log('  - Sections:', config.col.sections);
  console.log('  - Audio Files:', config.col.audioFiles);
  console.log('Audio Bucket ID:', config.audio);
}
