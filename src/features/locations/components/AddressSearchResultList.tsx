import { LocationSearchResult } from "@/features/locations/types";
import AddressSearchResultItem from "./AddressSearchResultItem";

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
      <p className="py-10 text-center text-sm text-gray-400">
        장소명이나 주소를 검색해주세요.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        장소를 검색하고 있습니다.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        검색 결과가 없습니다.
      </p>
    );
  }

  return (
    <ul>
      {items.map((location) => (
        <AddressSearchResultItem
          key={location.id}
          location={location}
          isSelecting={selectingLocationId === location.id}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
