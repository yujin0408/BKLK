"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Button from "@/components/common/Button";
import FormSection from "@/components/layout/FormSection";
import { SelectedBook } from "@/features/books/types";

interface BookSelectFieldProps {
  book: SelectedBook | null;
  onClick: () => void;
}

export default function BookSelectField({
  book,
  onClick,
}: BookSelectFieldProps) {
  return (
    <FormSection
      label="함께 읽을 책"
      description="모임에서 함께 읽을 책을 선택해주세요."
    >
      {book ? (
        <div className="flex items-center gap-5 rounded-xl border border-gray-100 p-5">
          <div className="relative h-[140px] w-[100px] shrink-0 overflow-hidden rounded-md bg-gray-100">
            <Image
              src={book.coverImageUrl || "/card_thumbnail.png"}
              alt={`${book.title} 표지`}
              fill
              sizes="100px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-lg font-semibold text-black-900">
              {book.title}
            </h3>

            <p className="mt-2 text-sm text-gray-500">{book.author}</p>

            {book.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                {book.description}
              </p>
            )}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onClick}>
            <Search size={16} />책 변경
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="
            flex w-full flex-col items-center justify-center gap-3
            rounded-xl border border-dashed border-gray-200
            px-6 py-12 text-gray-400
            transition-colors
            hover:border-black-900 hover:text-black-900
          "
        >
          <Search size={28} />

          <div className="text-center">
            <p className="font-medium">책을 검색해주세요</p>
            <p className="mt-1 text-sm">
              제목이나 저자명으로 책을 찾을 수 있어요.
            </p>
          </div>
        </button>
      )}
    </FormSection>
  );
}
