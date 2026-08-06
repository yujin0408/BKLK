"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import AddressSearchInput from "./AddressSearchInput";
import getLocationRegion from "@/features/locations/api/getLocationRegion";
import useLocationSearch from "@/features/locations/hooks/useLocationSearch";
import {
  LocationSearchResult,
  SelectedLocation,
} from "@/features/locations/types";
import AddressSearchResultList from "./AddressSearchResultList";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (location: SelectedLocation) => void;
}

interface AddressSearchDialogProps {
  onOpenChange: (open: boolean) => void;
  onSelect: (location: SelectedLocation) => void;
}

export default function AddressSearchModal({
  open,
  onOpenChange,
  onSelect,
}: Props) {
  if (!open) return null;

  return (
    <AddressSearchDialog onOpenChange={onOpenChange} onSelect={onSelect} />
  );
}

function AddressSearchDialog({
  onOpenChange,
  onSelect,
}: AddressSearchDialogProps) {
  const {
    keyword,
    setKeyword,
    submit,
    submittedKeyword,
    data,
    isFetching,
    isError,
    error,
  } = useLocationSearch();

  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [selectingLocationId, setSelectingLocationId] = useState<string | null>(
    null,
  );
  const [selectError, setSelectError] = useState<string | null>(null);

  const isSelecting = selectingLocationId !== null;

  useEffect(() => {
    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSelecting) return;

        onOpenChange(false);
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
  }, [isSelecting, onOpenChange]);

  const isSearching = Boolean(submittedKeyword);
  const items = data ?? [];

  const handleClose = () => {
    if (isSelecting) return;

    onOpenChange(false);
  };

  const handleSelect = async (location: LocationSearchResult) => {
    if (isSelecting) return;

    setSelectingLocationId(location.id);
    setSelectError(null);

    try {
      const region = await getLocationRegion({
        longitude: location.longitude,
        latitude: location.latitude,
      });

      onSelect({
        placeName: location.placeName,
        address: location.displayAddress,
        region1DepthName: region.region1DepthName,
        region2DepthName: region.region2DepthName,
        longitude: location.longitude,
        latitude: location.latitude,
      });

      onOpenChange(false);
    } catch (selectLocationError) {
      console.error("장소 선택 처리에 실패했습니다.", selectLocationError);

      setSelectError(
        selectLocationError instanceof Error
          ? selectLocationError.message
          : "장소 선택 중 오류가 발생했습니다.",
      );
    } finally {
      setSelectingLocationId(null);
    }
  };

  const searchErrorMessage =
    error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            장소 검색
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            disabled={isSelecting}
            onClick={handleClose}
            aria-label="장소 검색 모달 닫기"
            className="text-gray-400 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <AddressSearchInput
          value={keyword}
          disabled={isSelecting}
          onChange={(value) => {
            setKeyword(value);

            if (selectError) {
              setSelectError(null);
            }
          }}
          onSubmit={submit}
        />

        {isError && (
          <p role="alert" className="mb-3 text-sm text-error">
            {searchErrorMessage}
          </p>
        )}

        {selectError && (
          <p role="alert" className="mb-3 text-sm text-error">
            {selectError}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          <AddressSearchResultList
            items={items}
            loading={isFetching}
            isSearching={isSearching}
            disabled={isSelecting}
            selectingLocationId={selectingLocationId}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
