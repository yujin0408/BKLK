"use client";

import SearchInput from "@/components/common/SearchInput";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function BookSearchInput({ value, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="mb-4"
    >
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="제목 또는 저자명으로 검색"
      />
    </form>
  );
}
