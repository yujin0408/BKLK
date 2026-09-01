"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookSearchInput from "@/features/books/components/BookSearchInput";
import BookCategoryTabs from "@/features/books/components/BookCategoryTabs";
import BestsellerBookList from "@/features/books/components/BestsellerBookList";
import { useBookCategories } from "@/features/books/hooks/useBookCategories";
import { useInfiniteBookSearch } from "@/features/books/hooks/useInfiniteBookSearch";
import { useBestsellers } from "@/features/books/hooks/useBestsellers";
import { useSaveBook } from "@/features/books/hooks/useSaveBook";
import type { BookSearchResult } from "@/features/books/types";
import { toCreateBookInput } from "@/features/books/utils/mapAladinBook";

const BESTSELLER_PAGE_SIZE = 9;

export default function BooksMain() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("bestseller");
  const [visibleCount, setVisibleCount] = useState(BESTSELLER_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState<string | null>(null);
  const categories = useBookCategories();
  const bestsellers = useBestsellers(selectedCategory);
  const search = useInfiniteBookSearch(submittedKeyword);
  const saveBook = useSaveBook();
  const [pendingBookId, setPendingBookId] = useState<number>();
  const isSavingBookRef = useRef(false);
  const isSearching = Boolean(submittedKeyword);
  const searchBooks = useMemo(() => {
    const books = search.data?.pages.flatMap((page) => page.books) ?? [];

    return books.filter(
      (book, index) =>
        books.findIndex(
          ({ aladinItemId }) => aladinItemId === book.aladinItemId,
        ) === index,
    );
  }, [search.data]);
  const books = isSearching ? searchBooks : (bestsellers.data ?? []);
  const isLoading = isSearching ? search.isLoading : bestsellers.isLoading;
  const isError = isSearching ? search.isError : bestsellers.isError;
  const totalSearchResults = search.data?.pages[0]?.totalResults ?? 0;
  const selectedName =
    selectedCategory === "bestseller"
      ? "전체"
      : (categories.data?.find(({ slug }) => slug === selectedCategory)?.name ??
        "선택한 카테고리");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(BESTSELLER_PAGE_SIZE);
  };

  const handleSearch = () => {
    const keyword = searchInput.trim();

    setVisibleCount(BESTSELLER_PAGE_SIZE);

    if (!keyword) {
      setSearchInput("");
      setSubmittedKeyword(null);
      return;
    }

    setSearchInput(keyword);
    setSubmittedKeyword(keyword);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSubmittedKeyword(null);
    setVisibleCount(BESTSELLER_PAGE_SIZE);
  };

  const handleMore = async () => {
    const nextVisibleCount = visibleCount + BESTSELLER_PAGE_SIZE;

    if (
      isSearching &&
      nextVisibleCount > books.length &&
      search.hasNextPage
    ) {
      await search.fetchNextPage();
    }

    setVisibleCount(nextVisibleCount);
  };

  const handleBookSelect = async (book: BookSearchResult) => {
    if (isSavingBookRef.current) {
      return;
    }

    isSavingBookRef.current = true;
    setPendingBookId(book.aladinItemId);

    try {
      const savedBook = await saveBook.mutateAsync(toCreateBookInput(book));

      router.push(`/books/${savedBook.id}`);
    } catch (error) {
      isSavingBookRef.current = false;
      setPendingBookId(undefined);
      console.error("도서 저장 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "도서 저장 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-300 px-5 pb-10 pt-8 sm:px-8">
      <section className="mx-auto rounded-xl border border-line-200 bg-bg-blue px-6 py-7 sm:px-9 sm:py-8">
        <h1 className="text-2xl font-bold text-black-800">오늘의 책</h1>
        <p className="mt-2 text-md text-black-300">
          지금 많이 읽는 책을 만나보세요.
        </p>
      </section>

      <section className="mx-auto mt-8">
        <div aria-label="책 검색">
          <BookSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
            showSubmitButton
            onClear={handleClearSearch}
          />
        </div>

        {!isSearching && (
          <div className="mt-10" aria-labelledby="category-heading">
          <h2
            id="category-heading"
            className="mb-4 text-lg font-bold text-black-800"
          >
            카테고리
          </h2>
          {categories.isLoading && (
            <p className="py-8 text-center text-sm text-black-300">
              카테고리를 불러오는 중입니다.
            </p>
          )}
          {categories.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-4 text-center text-sm text-error"
            >
              카테고리를 불러오지 못했습니다. 전체 베스트셀러는 계속 볼 수
              있습니다.
            </p>
          )}
            {!categories.isLoading && (
              <BookCategoryTabs
                categories={categories.data ?? []}
                selectedSlug={selectedCategory}
                onSelect={handleCategorySelect}
              />
            )}
          </div>
        )}
      </section>

      <section className="mt-14" aria-labelledby="bestseller-heading">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-line-200 pb-4">
          <div>
            <p className="text-xs font-semibold text-brand-primary">
              {isSearching ? "SEARCH" : "BESTSELLER"}
            </p>
            <h2
              id="bestseller-heading"
              className="mt-1 text-2xl font-bold text-black-800"
            >
              {isSearching
                ? `'${submittedKeyword}' 검색 결과`
                : `${selectedName} 베스트셀러`}
            </h2>
            {isSearching && search.data && (
              <p className="mt-2 text-sm text-black-300">
                총 {totalSearchResults.toLocaleString("ko-KR")}건
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            aria-label={isSearching ? "검색 결과 로딩 중" : "베스트셀러 로딩 중"}
          >
            {Array.from({ length: 9 }, (_, index) => (
              <div key={index} className="flex animate-pulse gap-4 p-3">
                <div className="h-36 w-24 shrink-0 rounded-md bg-gray-100" />
                <div className="flex-1 space-y-3 pt-3">
                  <div className="h-5 w-8 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-6 py-12 text-center"
          >
            <p className="text-sm font-semibold text-error">
              {isSearching
                ? "검색 결과를 불러오지 못했습니다."
                : "베스트셀러를 불러오지 못했습니다."}
            </p>
            <button
              type="button"
              onClick={() =>
                isSearching ? search.refetch() : bestsellers.refetch()
              }
              className="mt-4 text-sm font-semibold text-brand-primary underline underline-offset-4"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && books.length === 0 && (
            <p className="rounded-xl bg-bg-blue px-6 py-16 text-center text-sm text-black-300">
              {isSearching
                ? "검색 결과가 없습니다."
                : "이 카테고리의 베스트셀러가 없습니다."}
            </p>
          )}

        {books.length > 0 && (
          <BestsellerBookList
            books={books}
            visibleCount={visibleCount}
            onSelect={handleBookSelect}
            pendingBookId={pendingBookId}
          />
        )}

        {(visibleCount < books.length ||
          (isSearching && search.hasNextPage)) && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleMore}
              disabled={isSearching && search.isFetchingNextPage}
              className="rounded-md border border-brand-primary bg-white px-10 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-bg-blue"
            >
              MORE
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
