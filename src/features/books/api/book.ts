import type {
  BookSearchResult,
  CreateBookInput,
  SelectedBook,
} from "@/features/books/types";

interface BookListResponse {
  books: BookSearchResult[];
  totalResults?: number;
}

interface SaveBookResponse {
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
  };
  created: boolean;
}

export async function getBestsellers(): Promise<BookSearchResult[]> {
  const response = await fetch("/api/books/bestsellers");

  if (!response.ok) {
    throw new Error("베스트셀러를 가져오지 못했습니다.");
  }

  const data: unknown = await response.json();

  if (!isBookListResponse(data)) {
    throw new Error("베스트셀러 응답 형식이 올바르지 않습니다.");
  }

  return data.books;
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const response = await fetch(
    `/api/books/search?query=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("도서 검색에 실패했습니다.");
  }

  const data: unknown = await response.json();

  if (!isBookListResponse(data)) {
    throw new Error("도서 검색 응답 형식이 올바르지 않습니다.");
  }

  return data.books;
}

export async function saveBook(input: CreateBookInput): Promise<SelectedBook> {
  const response = await fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ book: input }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      isErrorResponse(data) && data.message
        ? data.message
        : "도서 저장에 실패했습니다.";

    throw new Error(message);
  }

  if (!isSaveBookResponse(data)) {
    throw new Error("도서 저장 응답 형식이 올바르지 않습니다.");
  }

  return {
    id: data.book.id,
    title: data.book.title,
    author: data.book.author,
    coverImageUrl: data.book.cover_image_url,
  };
}

function isBookListResponse(value: unknown): value is BookListResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "books" in value &&
    Array.isArray(value.books)
  );
}

function isSaveBookResponse(value: unknown): value is SaveBookResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("book" in value) ||
    typeof value.book !== "object" ||
    value.book === null
  ) {
    return false;
  }

  const { book } = value;

  return (
    "id" in book &&
    typeof book.id === "string" &&
    "title" in book &&
    typeof book.title === "string" &&
    "author" in book &&
    typeof book.author === "string" &&
    "cover_image_url" in book &&
    (typeof book.cover_image_url === "string" || book.cover_image_url === null)
  );
}

function isErrorResponse(value: unknown): value is { message?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    (!("message" in value) || typeof value.message === "string")
  );
}
