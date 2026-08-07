import { MapPin } from "lucide-react";
import { LocationSearchResult } from "@/features/locations/types";

interface AddressSearchResultItemProps {
  location: LocationSearchResult;
  isSelecting: boolean;
  disabled: boolean;
  onSelect: (location: LocationSearchResult) => void;
}

export default function AddressSearchResultItem({
  location,
  isSelecting,
  disabled,
  onSelect,
}: AddressSearchResultItemProps) {
  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(location)}
        className="flex w-full gap-3 border-b border-gray-200 px-1 py-4 text-left transition-colors last:border-b-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MapPin
          aria-hidden="true"
          className="mt-1 size-5 shrink-0 text-gray-500"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <strong className="truncate text-sm font-semibold text-black-900">
              {location.placeName}
            </strong>

            {isSelecting && (
              <span className="shrink-0 text-xs text-gray-500">선택 중...</span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-700">
            {location.displayAddress}
          </p>

          {Boolean(location.roadAddress && location.address) && (
            <p className="mt-1 text-xs text-gray-500">{location.address}</p>
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
}
