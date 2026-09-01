import { useInfiniteQuery } from "@tanstack/react-query";
import { searchBookPage } from "@/features/books/api/book";

export function useInfiniteBookSearch(keyword: string | null) {
  return useInfiniteQuery({
    queryKey: ["books", "search", "infinite", keyword],
    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;

      return searchBookPage(keyword ?? "", page);
    },
    enabled: Boolean(keyword),
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce(
        (count, page) => count + page.books.length,
        0,
      );

      if (
        lastPage.books.length === 0 ||
        loadedCount >= lastPage.totalResults
      ) {
        return undefined;
      }

      return lastPage.startIndex + 1;
    },
  });
}
