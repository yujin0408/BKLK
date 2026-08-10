import {
  MeetingFormInitialData,
  MeetingFormValues,
} from "@/features/meetings/types";

export interface EditableMeeting {
  title: string;
  description: string;
  thumbnail_url: string | null;
  meeting_at: string;
  capacity: number;
  current_participants: number;
  address: string | null;
  detail_address: string | null;
  region_1depth_name: string;
  region_2depth_name: string;
  longitude: number;
  latitude: number;
  host_user_id: string;
  host: {
    id: string;
    nickname: string;
    profile_image_url: string | null;
    description: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
  } | null;
}

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
    meetingDate: new Date(year, month - 1, day),
    meetingTime: `${values.hour}:${values.minute}`,
  };
}

export default function toMeetingFormInitialData(
  meeting: EditableMeeting,
): MeetingFormInitialData | null {
  if (!meeting.book) {
    return null;
  }

  const { meetingDate, meetingTime } = toKoreanDateParts(meeting.meeting_at);

  const values: MeetingFormValues = {
    title: meeting.title,
    description: meeting.description,
    meetingDate,
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
    selectedBook: {
      id: meeting.book.id,
      title: meeting.book.title,
      author: meeting.book.author,
      coverImageUrl: meeting.book.cover_image_url,
    },
    thumbnailUrl: meeting.thumbnail_url,
    currentParticipants: meeting.current_participants,
  };
}
