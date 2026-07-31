"use client";

import { Camera, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FormSection from "@/components/layout/FormSection";

interface MeetingThumbnailFieldProps {
  onChange: (file: File | null) => void;
}

export default function MeetingThumbnailField({
  onChange,
}: MeetingThumbnailFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);

    setPreviewUrl(nextPreviewUrl);
    onChange(file);
  };

  const handleThumbnailRemove = () => {
    setPreviewUrl(null);
    onChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <FormSection label="대표 이미지">
      <p className="mb-3 text-sm text-gray-400">
        이미지를 등록하지 않으면 기본 이미지가 표시됩니다.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="
            flex size-32 flex-col items-center justify-center gap-2
            rounded-xl border border-dashed border-gray-300
            bg-gray-50 text-gray-500 transition-colors
            hover:border-gray-500 hover:bg-gray-100
          "
        >
          <Camera aria-hidden="true" className="size-6" />

          <span className="text-sm font-medium">이미지 추가</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleThumbnailChange}
          className="hidden"
        />

        {previewUrl && (
          <div className="relative size-32 overflow-visible">
            <div className="relative size-full overflow-hidden rounded-xl border border-line-100">
              <Image
                src={previewUrl}
                alt="대표 이미지 미리보기"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={handleThumbnailRemove}
              aria-label="대표 이미지 삭제"
              className="
                absolute -top-2 -right-2 flex size-7
                items-center justify-center rounded-full
                border border-line-100 bg-white shadow-sm
              "
            >
              <X aria-hidden="true" className="size-4 text-black-900" />
            </button>
          </div>
        )}
      </div>
    </FormSection>
  );
}
