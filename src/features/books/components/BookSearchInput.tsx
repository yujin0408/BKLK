"use client";

import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/common/Button";
import { X } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  showSubmitButton?: boolean;
  onClear?: () => void;
}

export default function BookSearchInput({
  value,
  onChange,
  onSubmit,
  showSubmitButton = false,
  onClear,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="mb-4 flex items-start gap-2"
    >
      <div className="min-w-0 flex-1">
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder="제목 또는 저자명으로 검색"
        />
      </div>
      {showSubmitButton && (
        <Button type="submit" size="md">
          검색
        </Button>
      )}
      {onClear && value.length > 0 && (
        <Button
          type="button"
          size="md"
          variant="outline"
          onClick={onClear}
          aria-label="검색 초기화"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
    </form>
  );
}
