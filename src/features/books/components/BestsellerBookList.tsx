import BestsellerBookItem from "@/features/books/components/BestsellerBookItem";
import type { BookSearchResult } from "@/features/books/types";

interface Props {
  books: BookSearchResult[];
}

export default function BestsellerBookList({ books }: Props) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {books.slice(0, 9).map((book, index) => (
        <BestsellerBookItem
          key={book.aladinItemId}
          book={book}
          rank={index + 1}
        />
      ))}
    </ol>
  );
}
