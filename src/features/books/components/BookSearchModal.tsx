"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import BookSearchInput from "./BookSearchInput";
import BookSearchResultList from "./BookSearchResultList";
import { useBestsellers } from "@/features/books/hooks/useBestsellers";
import { useBookSearch } from "@/features/books/hooks/useBookSearch";
import { useSaveBook } from "@/features/books/hooks/useSaveBook";
import { BookSearchResult } from "@/features/books/types";
import { toCreateBookInput } from "@/features/books/utils/mapAladinBook";

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

  const {
    keyword,
    setKeyword,
    submit,
    reset,
    submittedKeyword,
    data,
    isFetching,
    isError,
  } = useBookSearch();

  const saveMutation = useSaveBook();

  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChangeRef.current(false);
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;

      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        ),
      ).filter(
        (element) =>
          !element.hasAttribute("aria-hidden") &&
          element.getClientRects().length > 0,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (activeElement === lastElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusedElementRef.current?.focus();
    };
  }, [open]);

  const isSearching = Boolean(submittedKeyword);
  const items = isSearching ? (data ?? []) : (bestsellers.data ?? []);
  const loading = isSearching ? isFetching : bestsellers.isFetching;

  const handleSelect = async (book: BookSearchResult) => {
    if (saveMutation.isLoading) return;

    const input = toCreateBookInput(book);

    try {
      const saved = await saveMutation.mutateAsync(input);

      onSelect(saved);
      onOpenChange(false);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "도서 저장 중 오류가 발생했습니다.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            책 검색
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="책 검색 모달 닫기"
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <BookSearchInput
          value={keyword}
          onChange={setKeyword}
          onSubmit={submit}
        />

        {isError && (
          <p role="alert" className="text-sm text-error">
            검색 중 오류가 발생했습니다.
          </p>
        )}

        <div className="max-h-[60vh] overflow-auto">
          <BookSearchResultList
            items={items}
            onSelect={handleSelect}
            loading={loading}
            isSearching={isSearching}
            disabled={saveMutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
