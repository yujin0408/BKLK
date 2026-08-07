import type {
  AladinBookItem,
  BookCategorySource,
  BookSearchResult,
  CreateBookInput,
} from "@/features/books/types";

function normalizeString(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function normalizeNumber(value?: number | string | null): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : null;
}

export function mapAladinBookItem(item: AladinBookItem): BookSearchResult {
  return {
    aladinItemId: normalizeNumber(item.itemId) ?? 0,
    isbn13: normalizeString(item.isbn13 ?? item.isbn),
    title: normalizeString(item.title) ?? "제목 없음",
    author: normalizeString(item.author) ?? "알 수 없음",
    description: normalizeString(item.description),
    coverImageUrl: normalizeString(item.cover),
    aladinCategoryId: normalizeNumber(item.categoryId),
    aladinCategoryName: normalizeString(item.categoryName),
    publisher: normalizeString(item.publisher),
    pubDate: normalizeString(item.pubDate),
    link: normalizeString(item.link),
  };
}

export function toCreateBookInput(
  book: BookSearchResult,
  overrides?: {
    categoryId?: number | null;
    categorySource?: BookCategorySource;
  },
): CreateBookInput {
  return {
    aladinItemId: book.aladinItemId,
    isbn13: book.isbn13,
    title: book.title.trim(),
    author: book.author.trim(),
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    aladinCategoryId: book.aladinCategoryId,
    aladinCategoryName: book.aladinCategoryName,
    categoryId: overrides?.categoryId ?? null,
    categorySource: overrides?.categorySource ?? "unclassified",
  };
}

export default mapAladinBookItem;
