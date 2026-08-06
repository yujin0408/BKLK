"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import MeetingFormActions from "./MeetingFormActions";
import MeetingInfoFields from "./MeetingInfoFields";
import MeetingLocationFields from "./MeetingLocationFields";
import MeetingScheduleFields from "./MeetingScheduleFields";
import MeetingThumbnailField from "./MeetingThumbnailField";
import useMeetingForm from "@/features/meetings/hooks/useMeetingForm";
import BookSelectField from "./BookSelectFiled";
import BookSearchModal from "@/features/books/components/BookSearchModal";

export default function MeetingForm() {
  const router = useRouter();

  const {
    values,
    selectedBook,
    thumbnailFile,
    updateField,
    setSelectedBook,
    setThumbnailFile,
  } = useMeetingForm();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setSubmitError(null);

    if (!selectedBook) {
      setSubmitError("함께 읽을 책을 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log({
        values,
        selectedBook,
        thumbnailFile,
      });

      /*
       * 이후 아래 순서로 등록 로직을 구현하면 됩니다.
       *
       * 1. 폼 입력값 검증
       * 2. 선택한 책을 books 테이블에 저장하고 bookId 반환
       * 3. 대표 이미지가 있으면 Storage에 업로드
       * 4. 날짜와 시간을 meeting_at으로 결합
       * 5. meetings 테이블에 모임 등록
       * 6. 생성된 모임 상세 페이지로 이동
       *
       * const bookId = await saveBook(selectedBook);
       * const thumbnailUrl = thumbnailFile
       *   ? await uploadMeetingThumbnail(thumbnailFile)
       *   : null;
       *
       * const meeting = await createMeeting({
       *   ...values,
       *   bookId,
       *   thumbnailUrl,
       * });
       *
       * router.push(`/meetings/${meeting.id}`);
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
      <form onSubmit={handleSubmit}>
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black-900">내 모임 만들기</h1>
        </div>

        <div className="space-y-8">
          <BookSelectField
            book={selectedBook}
            onClick={() => setIsBookModalOpen(true)}
          />

          <MeetingInfoFields
            title={values.title}
            description={values.description}
            updateField={updateField}
          />

          <MeetingScheduleFields
            values={{
              meetingDate: values.meetingDate,
              meetingTime: values.meetingTime,
              capacity: values.capacity,
            }}
            updateField={updateField}
          />

          <MeetingLocationFields
            address={values.address}
            detailAddress={values.detailAddress}
            onSearch={() => setIsAddressModalOpen(true)}
            onDetailAddressChange={(value) =>
              updateField("detailAddress", value)
            }
          />

          <MeetingThumbnailField onChange={setThumbnailFile} />
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
          setIsBookModalOpen(false);
        }}
      />
    </>
  );
}
