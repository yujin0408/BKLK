"use client";

import BookSearchResultItem from "./BookSearchResultItem";
import type { BookSearchResult } from "@/features/books/types";

interface Props {
  items: BookSearchResult[];
  onSelect: (book: BookSearchResult) => void;
  loading?: boolean;
  isSearching?: boolean;
}

export default function BookSearchResultList({
  items,
  onSelect,
  loading = false,
  isSearching = false,
}: Props) {
  if (loading) {
    return <p className="p-6 text-center text-sm text-gray-500">검색 중...</p>;
  }

  if (items.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-gray-500">
        {isSearching
          ? "검색 결과가 없습니다."
          : "검색어를 입력하면 도서를 찾을 수 있습니다."}
      </p>
    );
  }

  return (
    <ul>
      {items.map((book) => (
        <BookSearchResultItem
          key={book.aladinItemId}
          book={book}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
