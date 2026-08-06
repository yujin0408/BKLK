import { MeetingFormValues } from "@/features/meetings/types";

interface SelectedBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
}

export type MeetingFormField =
  | "book"
  | "title"
  | "description"
  | "meetingDate"
  | "meetingTime"
  | "capacity"
  | "address"
  | "detailAddress"
  | "thumbnail";

export type MeetingFormErrors = Partial<Record<MeetingFormField, string>>;

interface ValidateMeetingFormParams {
  values: MeetingFormValues;
  selectedBook: SelectedBook | null;
  thumbnailFile: File | null;
}

const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 50;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_CAPACITY = 2;
const MAX_CAPACITY = 100;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];

function combineMeetingDateTime(
  meetingDate: Date,
  meetingTime: string,
): Date | null {
  const [hourString, minuteString] = meetingTime.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const result = new Date(meetingDate);
  result.setHours(hour, minute, 0, 0);

  return result;
}

export default function validateMeetingForm({
  values,
  selectedBook,
  thumbnailFile,
}: ValidateMeetingFormParams): MeetingFormErrors {
  const errors: MeetingFormErrors = {};

  if (!selectedBook) {
    errors.book = "함께 읽을 책을 선택해주세요.";
  }

  const trimmedTitle = values.title.trim();

  if (!trimmedTitle) {
    errors.title = "모임 제목을 입력해주세요.";
  } else if (trimmedTitle.length < MIN_TITLE_LENGTH) {
    errors.title = `모임 제목은 ${MIN_TITLE_LENGTH}자 이상 입력해주세요.`;
  } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    errors.title = `모임 제목은 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`;
  }

  const trimmedDescription = values.description.trim();

  if (!trimmedDescription) {
    errors.description = "모임 소개를 입력해주세요.";
  } else if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `모임 소개는 ${MIN_DESCRIPTION_LENGTH}자 이상 입력해주세요.`;
  } else if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `모임 소개는 ${MAX_DESCRIPTION_LENGTH}자 이하로 입력해주세요.`;
  }

  if (!values.meetingDate) {
    errors.meetingDate = "모임 날짜를 선택해주세요.";
  }

  if (!values.meetingTime) {
    errors.meetingTime = "모임 시간을 선택해주세요.";
  }

  if (values.meetingDate && values.meetingTime) {
    const meetingDateTime = combineMeetingDateTime(
      values.meetingDate,
      values.meetingTime,
    );

    if (!meetingDateTime) {
      errors.meetingTime = "모임 시간이 올바르지 않습니다.";
    } else if (meetingDateTime.getTime() <= Date.now()) {
      errors.meetingDate = "모임 날짜와 시간은 현재 이후여야 합니다.";
    }
  }

  const capacity = Number(values.capacity);

  if (!values.capacity.trim()) {
    errors.capacity = "모집 인원을 입력해주세요.";
  } else if (!Number.isInteger(capacity)) {
    errors.capacity = "모집 인원은 정수로 입력해주세요.";
  } else if (capacity < MIN_CAPACITY) {
    errors.capacity = `모집 인원은 최소 ${MIN_CAPACITY}명입니다.`;
  } else if (capacity > MAX_CAPACITY) {
    errors.capacity = `모집 인원은 최대 ${MAX_CAPACITY}명입니다.`;
  }

  if (!values.address.trim()) {
    errors.address = "모임 장소를 선택해주세요.";
  }

  if (
    values.address &&
    (!values.region1DepthName ||
      !values.region2DepthName ||
      values.longitude === null ||
      values.latitude === null)
  ) {
    errors.address = "장소 정보가 올바르지 않습니다. 다시 선택해주세요.";
  }

  if (values.detailAddress.length > 100) {
    errors.detailAddress = "상세 주소는 100자 이하로 입력해주세요.";
  }

  if (thumbnailFile) {
    if (!ALLOWED_THUMBNAIL_TYPES.includes(thumbnailFile.type)) {
      errors.thumbnail = "대표 이미지는 JPG, PNG, WEBP만 등록할 수 있습니다.";
    } else if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      errors.thumbnail = "대표 이미지는 5MB 이하만 등록할 수 있습니다.";
    }
  }

  return errors;
}
