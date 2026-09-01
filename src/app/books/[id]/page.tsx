import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getBookDetail,
  getBookMeetings,
} from "@/features/books/api/book.server";
import BookDescription from "@/features/books/components/BookDescription";
import BookDetailActions from "@/features/books/components/BookDetailActions";
import BookMeetingList from "@/features/books/components/BookMeetingList";

interface Props {
  params: Promise<{ id: string }>;
}

function formatPublicationDate(date: string): string {
  const [year, month, day] = date.split("-");

  return [year, month, day].filter(Boolean).join(".");
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const [book, meetings] = await Promise.all([
    getBookDetail(id),
    getBookMeetings(id),
  ]);

  if (!book) {
    notFound();
  }

  const publication = [
    book.publisher,
    book.pubDate ? formatPublicationDate(book.pubDate) : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <main className="mx-auto w-full max-w-300 px-5 pb-16 pt-10 sm:px-8">
      <section className="flex flex-col gap-8 sm:flex-row sm:gap-10 lg:gap-14">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-56 shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm sm:mx-0 sm:w-52 lg:w-60">
          {book.coverImageUrl ? (
            <Image
              src={book.coverImageUrl}
              alt={`${book.title} 표지`}
              fill
              priority
              sizes="(max-width: 640px) 224px, 240px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-5 text-center text-sm text-gray-400">
              표지 이미지가 없습니다.
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 sm:pt-4">
          {book.aladinCategoryName && (
            <p className="text-sm font-semibold text-brand-primary">
              {book.aladinCategoryName}
            </p>
          )}
          <h1 className="mt-2 break-words text-3xl font-bold leading-tight text-black-800">
            {book.title}
          </h1>
          <p className="mt-5 text-base text-black-400">{book.author}</p>
          {publication.length > 0 && (
            <p className="mt-2 text-sm text-black-300">
              {publication.join(" · ")}
            </p>
          )}
          <BookDetailActions bookId={book.id} title={book.title} />
        </div>
      </section>

      <BookDescription description={book.description} />
      <BookMeetingList
        bookId={book.id}
        bookTitle={book.title}
        meetings={meetings}
      />
    </main>
  );
}
