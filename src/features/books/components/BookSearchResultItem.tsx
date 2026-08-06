"use client";

import Image from "next/image";
import Button from "@/components/common/Button";
import { BookSearchResult } from "@/features/books/types";

interface Props {
  book: BookSearchResult;
  onSelect: (book: BookSearchResult) => void;
  disabled?: boolean;
}

export default function BookSearchResultItem({
  book,
  onSelect,
  disabled,
}: Props) {
  return (
    <li className="flex items-start gap-4 border-b border-gray-100 py-4">
      <div className="relative h-21 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold line-clamp-2">{book.title}</h4>
        <p className="mt-1 text-xs text-gray-500">{book.author}</p>
        {book.description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
            {book.description}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <Button size="sm" onClick={() => onSelect(book)} disabled={disabled}>
          선택
        </Button>
      </div>
    </li>
  );
}
