import BestsellerBookItem from "@/features/books/components/BestsellerBookItem";
import type { BookSearchResult } from "@/features/books/types";

interface Props {
  books: BookSearchResult[];
  visibleCount: number;
  onSelect: (book: BookSearchResult) => void;
  pendingBookId?: number;
}

export default function BestsellerBookList({
  books,
  visibleCount,
  onSelect,
  pendingBookId,
}: Props) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {books.slice(0, visibleCount).map((book, index) => (
        <BestsellerBookItem
          key={book.aladinItemId}
          book={book}
          rank={index + 1}
          onSelect={onSelect}
          isPending={pendingBookId === book.aladinItemId}
        />
      ))}
    </ol>
  );
}
