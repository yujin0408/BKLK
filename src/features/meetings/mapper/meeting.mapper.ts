import { MeetingCardData, MeetingEntity } from "../types";

const DEFAULT_THUMBNAIL = "/card_thumbnail.png";

export const mapMeeting = (meeting: MeetingEntity): MeetingCardData => ({
  id: meeting.id,
  title: meeting.title,
  thumbnail: meeting.thumbnail_url ?? DEFAULT_THUMBNAIL,
  meetingAt: new Date(meeting.meeting_at).toLocaleDateString("ko-KR"),
  capacity: `${meeting.current_participants}/${meeting.capacity}`,
  region: `${meeting.region_1depth_name} ${meeting.region_2depth_name}`,
  status: meeting.status,
});
