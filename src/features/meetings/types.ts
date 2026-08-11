import { SelectedBook } from "@/features/books/types";

export interface MeetingEntity {
  id: string;
  title: string;
  thumbnail_url: string | null;
  meeting_at: string;
  capacity: number;
  current_participants: number;
  region_1depth_name: string;
  region_2depth_name: string;
  status: "recruiting" | "admission_closing" | "closed";
}

export interface MeetingCardData {
  id: string;
  title: string;
  thumbnail: string;
  meetingAt: string;
  capacity: string;
  region: string;
  status: "recruiting" | "admission_closing" | "closed";
}

export interface MeetingDetail {
  id: string;
  host_user_id: string;
  book_id: string | null;
  title: string;
  description: string;
  thumbnail_url: string | null;
  meeting_at: string;
  capacity: number;
  current_participants: number;
  status: "recruiting" | "admission_closing" | "closed";
  address: string | null;
  detail_address: string | null;
  region_1depth_name: string;
  region_2depth_name: string;
  longitude: number;
  latitude: number;
  host: {
    id: string;
    nickname: string;
    profile_image_url: string | null;
    description: string | null;
  } | null;
  book: {
    id: string;
    title: string;
    author: string;
    description: string | null;
    cover_image_url: string | null;
  } | null;
}

export interface MeetingFormValues {
  title: string;
  description: string;
  meetingDate: Date | undefined;
  meetingTime: string;
  capacity: string;
  address: string;
  detailAddress: string;
  region1DepthName: string;
  region2DepthName: string;
  longitude: number | null;
  latitude: number | null;
}

export const INITIAL_MEETING_FORM_VALUES: MeetingFormValues = {
  title: "",
  description: "",
  meetingDate: undefined,
  meetingTime: "",
  capacity: "",
  address: "",
  detailAddress: "",
  region1DepthName: "",
  region2DepthName: "",
  longitude: null,
  latitude: null,
};

export interface SelectedLocation {
  placeName: string;
  address: string;
  region1DepthName: string;
  region2DepthName: string;
  longitude: number;
  latitude: number;
}

export interface BookSearchResult {
  isbn: string;
  isbn13: string;
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  description: string;
  cover: string;
  link: string;
}

export interface MeetingFormInitialData {
  values: Omit<MeetingFormValues, "meetingDate">;
  meetingDateParts: {
    year: number;
    month: number;
    day: number;
  };
  selectedBook: SelectedBook | null;
  thumbnailUrl: string | null;
  currentParticipants: number;
  originalMeetingAt: string;
}
