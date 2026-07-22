"use client";

import { Camera, Search, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Input from "@/components/common/Input";
import DatePicker from "@/components/common/Datepicker";
import Button from "@/components/common/Button";

interface MeetingFormValues {
  bookId: string;
  title: string;
  description: string;
  meetingDate: Date | undefined;
  meetingTime: string;
  capacity: string;
  address: string;
  detailAddress: string;
}

const INITIAL_VALUES: MeetingFormValues = {
  bookId: "",
  title: "",
  description: "",
  meetingDate: undefined,
  meetingTime: "",
  capacity: "",
  address: "",
  detailAddress: "",
};

export default function MeetingForm() {
  const [values, setValues] = useState<MeetingFormValues>(INITIAL_VALUES);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const updateField = (
    key: keyof MeetingFormValues,
    value: string | Date | undefined,
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleThumbnailRemove = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(null);
    setThumbnailPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      ...values,
      thumbnailFile,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black-900">내 모임 만들기</h1>

        <button
          type="submit"
          className="
            rounded-lg bg-black-900 px-6 py-3
            text-sm font-semibold text-white
            transition-colors hover:bg-black-700
          "
        >
          등록하기
        </button>
      </div>

      <div className="space-y-8">
        <FormSection label="함께 읽을 책" required>
          <button
            type="button"
            className="
              flex min-h-28 w-full items-center justify-between
              rounded-xl border border-line-100 bg-white px-5 py-4
              text-left transition-colors hover:border-gray-300
            "
          >
            <div>
              <p className="font-medium text-black-900">
                함께 읽을 책을 선택해주세요
              </p>

              <p className="mt-1 text-sm text-gray-400">
                모임에서 함께 읽을 책을 검색해 선택할 수 있어요.
              </p>
            </div>

            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400"
            />
          </button>
        </FormSection>

        <FormSection label="모임 제목" required>
          <Input
            value={values.title}
            onChange={(value) => updateField("title", value)}
            placeholder="모임 제목을 입력해주세요"
            maxLength={50}
          />

          <CharacterCount current={values.title.length} max={50} />
        </FormSection>

        <FormSection label="모임 설명" required>
          <textarea
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="어떤 모임인지 자세히 소개해주세요"
            maxLength={1000}
            className="
              min-h-48 w-full resize-none rounded-xl border
              border-line-100 px-4 py-3 text-base text-black-900
              outline-none transition-colors
              placeholder:text-gray-300
              focus:border-active
            "
          />

          <CharacterCount current={values.description.length} max={1000} />
        </FormSection>

        <div className="grid gap-6 md:grid-cols-3">
          <FormSection label="모임 날짜" required>
            <DatePicker
              value={values.meetingDate}
              onChange={(date) => updateField("meetingDate", date)}
              inputClassName="w-full"
              className="w-full"
            />
          </FormSection>

          <FormSection label="모임 시간" required>
            <Input
              type="time"
              value={values.meetingTime}
              onChange={(value) => updateField("meetingTime", value)}
              onClick={(event) => {
                event.currentTarget.showPicker();
              }}
            />
          </FormSection>

          <FormSection label="모집 인원" required>
            <div className="relative">
              <Input
                type="number"
                min={2}
                max={20}
                value={values.capacity}
                onChange={(value) => updateField("capacity", value)}
                placeholder="2"
              />

              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-gray-500">
                명
              </span>
            </div>
          </FormSection>
        </div>

        <FormSection label="모임 장소" required>
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <Input
                value={values.address}
                onChange={(value) => updateField("address", value)}
                placeholder="주소를 검색해주세요"
                readOnly
              />

              <Button variant="outline" size="sm">
                주소 검색
              </Button>
            </div>

            <Input
              value={values.detailAddress}
              onChange={(value) => updateField("detailAddress", value)}
              placeholder="상세 주소를 입력해주세요"
            />
          </div>
        </FormSection>

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

            {thumbnailPreview && (
              <div className="relative size-32 overflow-visible">
                <div className="relative size-full overflow-hidden rounded-xl border border-line-100">
                  <Image
                    src={thumbnailPreview}
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
      </div>

      <div className="mt-12 flex justify-end gap-3 border-t border-line-100 pt-8">
        <button
          type="button"
          className="
            h-12 rounded-lg border border-line-100
            px-6 text-sm font-semibold text-black-700
            transition-colors hover:bg-gray-50
          "
        >
          취소
        </button>

        <button
          type="submit"
          className="
            h-12 rounded-lg bg-black-900 px-8
            text-sm font-semibold text-white
            transition-colors hover:bg-black-700
          "
        >
          등록하기
        </button>
      </div>
    </form>
  );
}

interface FormSectionProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormSection({ label, required = false, children }: FormSectionProps) {
  return (
    <section>
      <label className="mb-3 block text-base font-semibold text-black-900">
        {label}

        {required && (
          <span aria-label="필수 입력" className="ml-1 text-error">
            *
          </span>
        )}
      </label>

      {children}
    </section>
  );
}

interface CharacterCountProps {
  current: number;
  max: number;
}

function CharacterCount({ current, max }: CharacterCountProps) {
  return (
    <p className="mt-2 text-right text-xs text-gray-400">
      {current}/{max}
    </p>
  );
}
