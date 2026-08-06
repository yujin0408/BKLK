import { MapPin } from "lucide-react";
import { LocationSearchResult } from "@/features/locations/types";

interface Props {
  items: LocationSearchResult[];
  loading: boolean;
  isSearching: boolean;
  disabled?: boolean;
  selectingLocationId: string | null;
  onSelect: (location: LocationSearchResult) => void;
}

export default function AddressSearchResultList({
  items,
  loading,
  isSearching,
  disabled = false,
  selectingLocationId,
  onSelect,
}: Props) {
  if (!isSearching) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-gray-500">
        장소명이나 주소를 검색해주세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-48 items-center justify-center text-sm text-gray-500"
      >
        장소를 검색하고 있습니다.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <ul>
      {items.map((location) => {
        const isSelecting = selectingLocationId === location.id;

        return (
          <li
            key={location.id}
            className="border-b border-gray-200 last:border-b-0"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(location)}
              className="flex w-full gap-3 px-2 py-4 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MapPin
                size={20}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <strong className="truncate text-sm font-semibold text-black-900">
                    {location.placeName}
                  </strong>

                  {isSelecting && (
                    <span className="shrink-0 text-xs text-gray-500">
                      선택 중...
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-700">
                  {location.displayAddress}
                </p>

                {location.roadAddress &&
                  location.address &&
                  location.roadAddress !== location.address && (
                    <p className="mt-1 text-xs text-gray-500">
                      지번 {location.address}
                    </p>
                  )}

                {location.categoryName && (
                  <p className="mt-2 truncate text-xs text-gray-400">
                    {location.categoryName}
                  </p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
