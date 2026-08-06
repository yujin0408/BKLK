"use client";

import { useEffect } from "react";
import BookSearchInput from "./BookSearchInput";
import BookSearchResultList from "./BookSearchResultList";
import { useBestsellers } from "@/features/books/hooks/useBestsellers";
import { useBookSearch } from "@/features/books/hooks/useBookSearch";
import { useSaveBook } from "@/features/books/hooks/useSaveBook";
import { BookSearchResult } from "@/features/books/types";
import { toCreateBookInput } from "@/features/books/utils/mapAladinBook";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (book: {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string | null;
  }) => void;
}

export default function BookSearchModal({
  open,
  onOpenChange,
  onSelect,
}: Props) {
  const bestsellers = useBestsellers();
  const search = useBookSearch();
  const saveMutation = useSaveBook();

  useEffect(() => {
    // 모달 열릴 때 검색 상태 초기화 (UX 판단: 모달 닫힐 때 초기화)
    if (!open) {
      search.reset();
    }
  }, [open]);

  const isSearching = !!search.submittedKeyword;
  const items = isSearching ? (search.data ?? []) : (bestsellers.data ?? []);
  const loading = isSearching ? search.isFetching : bestsellers.isFetching;

  const handleSelect = async (book: BookSearchResult) => {
    if (saveMutation.isLoading) return;

    const input = toCreateBookInput(book);

    try {
      const saved = await saveMutation.mutateAsync(input);
      onSelect(saved);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "도서 저장 중 오류가 발생했습니다.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">책 검색</h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <BookSearchInput
          value={search.keyword}
          onChange={search.setKeyword}
          onSubmit={() => search.submit()}
        />

        {search.isError && (
          <p className="text-sm text-error">검색 중 오류가 발생했습니다.</p>
        )}

        <div className="max-h-[60vh] overflow-auto">
          <BookSearchResultList
            items={items}
            onSelect={handleSelect}
            loading={loading}
            isSearching={isSearching}
          />
        </div>
      </div>
    </div>
  );
}
