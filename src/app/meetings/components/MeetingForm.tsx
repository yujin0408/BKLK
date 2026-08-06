"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import MeetingFormActions from "./MeetingFormActions";
import MeetingInfoFields from "./MeetingInfoFields";
import MeetingLocationFields from "./MeetingLocationFields";
import MeetingScheduleFields from "./MeetingScheduleFields";
import MeetingThumbnailField from "./MeetingThumbnailField";
import BookSelectField from "./BookSelectFiled";
import BookSearchModal from "@/features/books/components/BookSearchModal";
import AddressSearchModal from "@/features/locations/components/AddressSearchModal";
import useMeetingForm from "@/features/meetings/hooks/useMeetingForm";
import validateMeetingForm, {
  MeetingFormErrors,
  MeetingFormField,
} from "@/features/meetings/utils/validateMeetingForm";

const MEETING_FORM_FIELDS = [
  "book",
  "title",
  "description",
  "meetingDate",
  "meetingTime",
  "capacity",
  "address",
  "detailAddress",
  "thumbnail",
] as const satisfies readonly MeetingFormField[];

function isMeetingFormField(field: PropertyKey): field is MeetingFormField {
  return MEETING_FORM_FIELDS.some((formField) => formField === field);
}

export default function MeetingForm() {
  const router = useRouter();

  const {
    values,
    selectedBook,
    thumbnailFile,
    updateField,
    setSelectedBook,
    setThumbnailFile,
    selectLocation,
  } = useMeetingForm();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MeetingFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearFieldError = (field: keyof MeetingFormErrors) => {
    setFieldErrors((previousErrors) => {
      if (!previousErrors[field]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[field];

      return nextErrors;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setSubmitError(null);

    const validationErrors = validateMeetingForm({
      values,
      selectedBook,
      thumbnailFile,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError("입력 내용을 확인해주세요.");
      return;
    }

    setFieldErrors({});

    if (!selectedBook) {
      return;
    }

    try {
      setIsSubmitting(true);

      console.log({
        values: {
          ...values,
          title: values.title.trim(),
          description: values.description.trim(),
          detailAddress: values.detailAddress.trim(),
          capacity: Number(values.capacity),
        },
        selectedBook,
        thumbnailFile,
      });

      /*
       * 다음 단계
       *
       * 1. thumbnailFile Storage 업로드
       * 2. meetingDate + meetingTime 결합
       * 3. meetings 테이블 insert
       * 4. 상세 페이지 이동
       */
    } catch (error) {
      console.error("모임 등록에 실패했습니다.", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "모임 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black-900">내 모임 만들기</h1>
        </div>

        <div className="space-y-8">
          <BookSelectField
            book={selectedBook}
            error={fieldErrors.book}
            onClick={() => setIsBookModalOpen(true)}
          />

          <MeetingInfoFields
            title={values.title}
            description={values.description}
            errors={{
              title: fieldErrors.title,
              description: fieldErrors.description,
            }}
            updateField={(field, value) => {
              updateField(field, value);

              if (isMeetingFormField(field)) {
                clearFieldError(field);
              }
            }}
          />

          <MeetingScheduleFields
            values={{
              meetingDate: values.meetingDate,
              meetingTime: values.meetingTime,
              capacity: values.capacity,
            }}
            errors={{
              meetingDate: fieldErrors.meetingDate,
              meetingTime: fieldErrors.meetingTime,
              capacity: fieldErrors.capacity,
            }}
            updateField={(field, value) => {
              updateField(field, value);

              if (isMeetingFormField(field)) {
                clearFieldError(field);
              }
            }}
          />

          <MeetingLocationFields
            address={values.address}
            detailAddress={values.detailAddress}
            errors={{
              address: fieldErrors.address,
              detailAddress: fieldErrors.detailAddress,
            }}
            onSearch={() => setIsAddressModalOpen(true)}
            onDetailAddressChange={(value) => {
              updateField("detailAddress", value);
              clearFieldError("detailAddress");
            }}
          />

          <MeetingThumbnailField
            error={fieldErrors.thumbnail}
            onChange={(file) => {
              setThumbnailFile(file);
              clearFieldError("thumbnail");
            }}
          />
        </div>

        {submitError && (
          <p role="alert" className="mt-6 text-sm font-medium text-error">
            {submitError}
          </p>
        )}

        <MeetingFormActions
          isSubmitting={isSubmitting}
          onCancel={() => router.back()}
        />
      </form>

      <BookSearchModal
        open={isBookModalOpen}
        onOpenChange={setIsBookModalOpen}
        onSelect={(book) => {
          setSelectedBook(book);
          clearFieldError("book");
          setIsBookModalOpen(false);
        }}
      />

      <AddressSearchModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        onSelect={(location) => {
          selectLocation(location);
          clearFieldError("address");
        }}
      />
    </>
  );
}
