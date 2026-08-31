"use client";

import { useState } from "react";
import BookSearchInput from "@/features/books/components/BookSearchInput";
import BookCategoryTabs from "@/features/books/components/BookCategoryTabs";
import BestsellerBookList from "@/features/books/components/BestsellerBookList";
import { useBookCategories } from "@/features/books/hooks/useBookCategories";
import { useBestsellers } from "@/features/books/hooks/useBestsellers";

export default function BooksMain() {
  const [selectedCategory, setSelectedCategory] = useState("bestseller");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const categories = useBookCategories();
  const bestsellers = useBestsellers(selectedCategory);
  const selectedName =
    selectedCategory === "bestseller"
      ? "전체"
      : (categories.data?.find(({ slug }) => slug === selectedCategory)?.name ??
        "선택한 카테고리");

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
            value={searchKeyword}
            onChange={(value) => {
              setSearchKeyword(value);
              setSearchNotice("");
            }}
            onSubmit={() => {
              if (searchKeyword.trim()) {
                setSearchNotice(
                  "상세 검색 결과 연결은 다음 단계에서 제공할 예정입니다.",
                );
              }
            }}
          />
          <p
            aria-live="polite"
            className="-mt-2 text-center text-xs text-black-300"
          >
            {searchNotice}
          </p>
        </div>

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
              onSelect={setSelectedCategory}
            />
          )}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="bestseller-heading">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-line-200 pb-4">
          <div>
            <p className="text-xs font-semibold text-brand-primary">
              BESTSELLER
            </p>
            <h2
              id="bestseller-heading"
              className="mt-1 text-2xl font-bold text-black-800"
            >
              {selectedName} 베스트셀러
            </h2>
          </div>
        </div>

        {bestsellers.isLoading && (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="베스트셀러 로딩 중"
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

        {bestsellers.isError && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 px-6 py-12 text-center"
          >
            <p className="text-sm font-semibold text-error">
              베스트셀러를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              onClick={() => bestsellers.refetch()}
              className="mt-4 text-sm font-semibold text-brand-primary underline underline-offset-4"
            >
              다시 시도
            </button>
          </div>
        )}

        {!bestsellers.isLoading &&
          !bestsellers.isError &&
          bestsellers.data?.length === 0 && (
            <p className="rounded-xl bg-bg-blue px-6 py-16 text-center text-sm text-black-300">
              이 카테고리의 베스트셀러가 없습니다.
            </p>
          )}

        {bestsellers.data && bestsellers.data.length > 0 && (
          <BestsellerBookList books={bestsellers.data} />
        )}

        {bestsellers.data && bestsellers.data.length > 9 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
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
