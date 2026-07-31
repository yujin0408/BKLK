export interface SelectedBook {
  aladinItemId: number;
  isbn13: string | null;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  aladinCategoryId: number | null;
  aladinCategoryName: string | null;
}
