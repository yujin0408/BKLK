import Image from "next/image";
import Link from "next/link";
import type { LibrarySummaryItem } from "@/features/mypage/types";

interface Props {
  items: LibrarySummaryItem[];
}

export default function LibrarySummary({ items }: Props) {
  return (
    <section aria-labelledby="library-heading" className="rounded-2xl border border-line-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 id="library-heading" className="text-2xl font-bold text-black-800">내 서재</h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.status} className="rounded-xl bg-bg-blue p-5">
            <div className="flex items-end justify-between gap-2">
              <h3 className="font-semibold text-black-700">{item.label}</h3>
              <strong className="text-2xl text-brand-primary">{item.count}<span className="ml-0.5 text-sm font-medium">권</span></strong>
            </div>

            {item.recentBook ? (
              <Link href={`/books/${item.recentBook.id}`} className="mt-5 flex min-w-0 gap-4 rounded-lg bg-white p-3 transition-shadow hover:shadow-sm">
                <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.recentBook.coverImageUrl ? (
                    <Image
                      src={item.recentBook.coverImageUrl}
                      alt={`${item.recentBook.title} 표지`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-1 text-center text-xs text-gray-400">표지 없음</div>
                  )}
                </div>
                <div className="min-w-0 self-center">
                  <p className="line-clamp-2 font-semibold leading-5 text-black-700">{item.recentBook.title}</p>
                  <p className="mt-2 truncate text-sm text-black-300">{item.recentBook.author}</p>
                </div>
              </Link>
            ) : (
              <div className="mt-5 flex min-h-28 items-center justify-center rounded-lg bg-white px-3 text-center text-sm text-gray-400">등록된 책이 없습니다.</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
