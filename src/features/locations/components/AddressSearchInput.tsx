"use client";

import { FormEvent } from "react";
import { Search } from "lucide-react";

interface Props {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AddressSearchInput({
  value,
  disabled = false,
  onChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="mb-4 flex gap-2">
      <label htmlFor="address-search-input" className="sr-only">
        장소명 또는 주소 검색
      </label>

      <input
        id="address-search-input"
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="장소명 또는 주소를 입력해주세요."
        autoComplete="off"
        className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-4 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-black-900 disabled:cursor-not-allowed disabled:bg-gray-100"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-black-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search size={18} aria-hidden="true" />
        검색
      </button>
    </form>
  );
}
