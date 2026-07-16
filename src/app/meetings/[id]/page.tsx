"use client";

import MeetingCalendar from "@/components/calendar/MeetingCalendar";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import KakaoMap from "@/components/common/KakaoMap";
import { getMeetingById } from "@/features/meetings/api/getMeetings";
import { CalendarDays, MapPin, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MeetingDetail {
  id: string;
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

const formatMeetingDate = (dateString: string) => {
  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day} ${hours}:${minutes}`;
};

function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchMeeting = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getMeetingById(id);
        setMeeting(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "모임 정보를 불러오지 못했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (isLoading) {
    return <div>불러오는 중...</div>;
  }

  if (errorMessage) {
    return <div>{errorMessage}</div>;
  }

  if (!meeting) {
    return <div>모임을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="pt-6">
      <div className="flex gap-10">
        <img
          src={meeting.thumbnail_url || "/card_thumbnail.png"}
          alt="모임 썸네일"
        />
        <div className="flex flex-col gap-3 w-full mt-5">
          <Badge variant={meeting.status}>
            {meeting.status === "recruiting"
              ? "모집중"
              : meeting.status === "admission_closing"
                ? "마감임박"
                : "모집완료"}
          </Badge>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <div className="flex gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CalendarDays /> {formatMeetingDate(meeting.meeting_at)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin /> {meeting.region_1depth_name}{" "}
              {meeting.region_2depth_name}
            </span>
            <span className="flex items-center gap-1">
              <User /> {meeting.current_participants}/{meeting.capacity}
            </span>
          </div>
          <div className="text-right mt-auto">
            <Button variant="solid">참가 신청하기</Button>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold mb-3">이런 모임이에요!</h3>
        <p>{meeting.description}</p>
      </div>
      <div className="mt-10 border-t border-gray-100 pt-10 text-center">
        <h3 className="text-lg font-bold mb-6">
          {meeting.host?.nickname}님이 개설한 모임입니다
        </h3>
        <img
          src={meeting.host?.profile_image_url || "/profile.jpg"}
          alt="Host Profile"
          className="rounded-full overflow-hidden w-40 h-40 m-auto"
        />
        <p className="text-gray-600 mt-5 max-w-2xl">
          {meeting.host?.description}
        </p>
      </div>
      <div>
        <div className="mt-10 flex gap-12 pt-10">
          <KakaoMap
            latitude={Number(meeting.latitude)}
            longitude={Number(meeting.longitude)}
          />
          <MeetingCalendar meetingAt={meeting.meeting_at} />
        </div>
        <div className="mt-10 flex justify-center gap-3 max-w-lg m-auto">
          <Button fullWidth>참가 신청하기</Button>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetailPage;
