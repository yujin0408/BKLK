import { MeetingFormValues } from "@/features/meetings/types";

interface UpdateMeetingParams {
  meetingId: string;
  values: MeetingFormValues;
  bookId: string;
  meetingAt: string;
  thumbnailFile: File | null;
  removeThumbnail: boolean;
}

export interface UpdatedMeeting {
  id: string;
}

interface ErrorResponse {
  message?: string;
}

export default async function updateMeeting({
  meetingId,
  values,
  bookId,
  meetingAt,
  thumbnailFile,
  removeThumbnail,
}: UpdateMeetingParams): Promise<UpdatedMeeting> {
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
  formData.append("removeThumbnail", String(removeThumbnail));

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  const response = await fetch(`/api/meetings/${meetingId}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(errorData?.message ?? "모임 수정 중 오류가 발생했습니다.");
  }

  return (await response.json()) as UpdatedMeeting;
}
