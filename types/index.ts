export interface AudioFile {
  id: string;
  title: string;
  duration: number; // duration in seconds
  url: string;
  fileId?: string; // Appwrite storage file ID
}

export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  imageUrl: string;
  audioFiles?: AudioFile[];
}

export interface CategoryData {
  id: string;
  title: string;
  sections: SectionItem[];
}
