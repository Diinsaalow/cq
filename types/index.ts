export interface SectionItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  imageUrl: string;
}

export interface CategoryData {
  id: string;
  title: string;
  sections: SectionItem[];
}