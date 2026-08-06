import { MeetingFormValues } from "@/features/meetings/types";

interface CreateMeetingParams {
  values: MeetingFormValues;
  bookId: string;
  meetingAt: string;
  thumbnailFile: File | null;
}

export interface CreatedMeeting {
  id: string;
}

interface ErrorResponse {
  message?: string;
}

export default async function createMeeting({
  values,
  bookId,
  meetingAt,
  thumbnailFile,
}: CreateMeetingParams): Promise<CreatedMeeting> {
  const formData = new FormData();

  formData.append("bookId", bookId);
  formData.append("title", values.title.trim());
  formData.append("description", values.description.trim());
  formData.append("meetingAt", meetingAt);
  formData.append("capacity", values.capacity);
  formData.append("address", values.address.trim());
  formData.append("detailAddress", values.detailAddress.trim());
  formData.append("region1DepthName", values.region1DepthName);
  formData.append("region2DepthName", values.region2DepthName);
  formData.append("longitude", String(values.longitude));
  formData.append("latitude", String(values.latitude));

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  const response = await fetch("/api/meetings", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(errorData?.message ?? "모임 등록 중 오류가 발생했습니다.");
  }

  return (await response.json()) as CreatedMeeting;
}
