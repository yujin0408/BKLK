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
