import Image from "next/image";
import type { BookSearchResult } from "@/features/books/types";

interface Props {
  book: BookSearchResult;
  rank: number;
  onSelect: (book: BookSearchResult) => void;
  isPending?: boolean;
}

export default function BestsellerBookItem({
  book,
  rank,
  onSelect,
  isPending = false,
}: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(book)}
        disabled={isPending}
        aria-label={`${book.title} 상세 보기`}
        className="group flex w-full min-w-0 gap-4 rounded-xl border border-transparent p-3 text-left transition hover:border-blue-200 hover:bg-bg-blue focus-visible:border-blue-200 focus-visible:bg-bg-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-wait disabled:opacity-60"
      >
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-sm">
          {book.coverImageUrl ? (
            <Image
              src={book.coverImageUrl}
              alt={`${book.title} 표지`}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
              표지 없음
            </div>
          )}
        </div>

        <div className="min-w-0 pt-2">
          <span className="text-xl font-bold text-brand-primary">
            {isPending ? "이동 중..." : rank}
          </span>
          <h3 className="mt-3 line-clamp-2 text-md font-semibold text-black-800">
            {book.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-black-300">
            {book.author}
          </p>
        </div>
      </button>
    </li>
  );
}
