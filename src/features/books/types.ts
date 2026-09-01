// Aladin 원본 응답 타입
export interface AladinBookItem {
  itemId?: number;
  title?: string;
  author?: string;
  pubDate?: string;
  description?: string;
  isbn?: string;
  isbn13?: string;
  cover?: string;
  categoryId?: number;
  categoryName?: string;
  publisher?: string;
  link?: string;
}

export interface AladinBookResponse {
  title?: string;
  link?: string;
  totalResults?: number;
  startIndex?: number;
  itemsPerPage?: number;
  item?: AladinBookItem[] | null;
}

// 모달에서 사용하는 타입
export interface BookSearchResult {
  aladinItemId: number;
  isbn13: string | null;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  aladinCategoryId: number | null;
  aladinCategoryName: string | null;
  publisher: string | null;
  pubDate: string | null;
  link: string | null;
}

// DB 저장 요청 타입
export type BookCategorySource = "manual" | "mapped" | "unclassified";

export interface CreateBookInput {
  aladinItemId: number;
  isbn13: string | null;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  aladinCategoryId: number | null;
  aladinCategoryName: string | null;
  publisher: string | null;
  pubDate: string | null;
  categoryId: number | null;
  categorySource: BookCategorySource;
}

// 폼에서 사용하는 최종 선택 타입 (DB 기반)
export interface SelectedBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  description?: string | null;
}

export interface BookSearchPage {
  books: BookSearchResult[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
}

export interface BookCategory {
  id: number;
  slug: string;
  name: string;
}

export interface BookDetail {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  aladinCategoryName: string | null;
  publisher: string | null;
  pubDate: string | null;
}
