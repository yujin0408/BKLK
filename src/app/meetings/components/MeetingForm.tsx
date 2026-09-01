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
import toMeetingAtIso from "@/features/meetings/utils/toMeetingAtIso";
import createMeeting from "@/features/meetings/api/createMeeting";
import updateMeeting from "@/features/meetings/api/updateMeeting";
import { MeetingFormInitialData } from "@/features/meetings/types";
import type { SelectedBook } from "@/features/books/types";

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

type MeetingFormProps =
  | {
      mode?: "create";
      meetingId?: never;
      initialData?: never;
      initialBook?: SelectedBook | null;
    }
  | {
      mode: "edit";
      meetingId: string;
      initialData: MeetingFormInitialData;
      initialBook?: never;
    };

export default function MeetingForm(props: MeetingFormProps) {
  const mode = props.mode ?? "create";
  const initialData = mode === "edit" ? props.initialData : undefined;
  const initialBook = mode === "create" ? props.initialBook : undefined;

  const router = useRouter();

  const {
    values,
    selectedBook,
    thumbnailFile,
    updateField,
    setSelectedBook,
    setThumbnailFile,
    selectLocation,
  } = useMeetingForm(initialData, initialBook);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<MeetingFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

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
      minimumCapacity:
        mode === "edit" ? initialData?.currentParticipants : undefined,
      originalMeetingAt:
        mode === "edit" ? initialData?.originalMeetingAt : undefined,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError("입력 내용을 확인해주세요.");
      return;
    }

    setFieldErrors({});

    if (
      !selectedBook ||
      !values.meetingDate ||
      values.longitude === null ||
      values.latitude === null
    ) {
      setSubmitError("입력 내용을 다시 확인해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const meetingAt = toMeetingAtIso(values.meetingDate, values.meetingTime);

      const meeting =
        props.mode === "edit"
          ? await updateMeeting({
              meetingId: props.meetingId,
              values,
              bookId: selectedBook.id,
              meetingAt,
              thumbnailFile,
              removeThumbnail,
            })
          : await createMeeting({
              values,
              bookId: selectedBook.id,
              meetingAt,
              thumbnailFile,
            });

      router.replace(`/meetings/${meeting.id}`);
      router.refresh();
    } catch (error) {
      console.error(
        mode === "edit"
          ? "모임 수정에 실패했습니다."
          : "모임 등록에 실패했습니다.",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? "모임 수정 중 오류가 발생했습니다."
            : "모임 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1 className="mb-8 text-2xl font-bold">
          {mode === "edit" ? "모임 수정하기" : "내 모임 만들기"}
        </h1>

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
            initialImageUrl={initialData?.thumbnailUrl}
            error={fieldErrors.thumbnail}
            onChange={(file) => {
              setThumbnailFile(file);

              if (file) {
                setRemoveThumbnail(false);
              }

              clearFieldError("thumbnail");
            }}
            onRemoveExisting={() => {
              setRemoveThumbnail(true);
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
          setIsAddressModalOpen(false);
        }}
      />
    </>
  );
}
