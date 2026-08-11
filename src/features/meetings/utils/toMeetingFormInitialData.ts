import { MeetingDetail } from "@/features/meetings/types";
import {
  MeetingFormInitialData,
  MeetingFormValues,
} from "@/features/meetings/types";

function toKoreanDateParts(meetingAt: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(meetingAt));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);

  return {
    // DatePicker가 로컬 날짜의 연/월/일만 사용한다는 기준입니다.
    meetingDateParts: { year, month, day },
    meetingTime: `${values.hour}:${values.minute}`,
  };
}

export default function toMeetingFormInitialData(
  meeting: MeetingDetail,
): MeetingFormInitialData {
  const { meetingDateParts, meetingTime } = toKoreanDateParts(
    meeting.meeting_at,
  );

  const values: Omit<MeetingFormValues, "meetingDate"> = {
    title: meeting.title,
    description: meeting.description,
    meetingTime,
    capacity: String(meeting.capacity),
    address: meeting.address ?? "",
    detailAddress: meeting.detail_address ?? "",
    region1DepthName: meeting.region_1depth_name,
    region2DepthName: meeting.region_2depth_name,
    longitude: meeting.longitude,
    latitude: meeting.latitude,
  };

  return {
    values,
    meetingDateParts,
    selectedBook: meeting.book
      ? {
          id: meeting.book.id,
          title: meeting.book.title,
          author: meeting.book.author,
          coverImageUrl: meeting.book.cover_image_url,
        }
      : null,
    thumbnailUrl: meeting.thumbnail_url,
    currentParticipants: meeting.current_participants,
    originalMeetingAt: meeting.meeting_at,
  };
}
