"use client";

import MeetingCalendar from "@/components/calendar/MeetingCalendar";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import KakaoMap from "@/components/common/KakaoMap";
import {
  deleteMeeting,
  getMeetingById,
} from "@/features/meetings/api/meetings";
import {
  applyMeeting,
  getParticipant,
} from "@/features/meetings/api/participant";
import { supabase } from "@/lib/supabase/client";
import { User as UserType } from "@supabase/supabase-js";
import {
  CalendarDays,
  EllipsisVertical,
  MapPin,
  Share2,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

interface Participant {
  id: string;
  status: string;
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
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const id = params.id;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isParticipantLoading, setIsParticipantLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const [user, setUser] = useState<UserType | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isHost = Boolean(user && user.id === meeting?.host?.id);
  const isFull = meeting
    ? meeting.current_participants >= meeting.capacity
    : false;

  const hasDisabledStatus =
    participant?.status === "pending" || participant?.status === "approved";

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

  useEffect(() => {
    const checkParticipant = async () => {
      try {
        setIsParticipantLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (!user) {
          setParticipant(null);
          return;
        }

        const data = await getParticipant(id, user.id);

        setParticipant(data);
      } catch (error) {
        console.error("참가 신청 여부 조회 실패:", error);
      } finally {
        setIsParticipantLoading(false);
      }
    };

    if (id) {
      checkParticipant();
    }
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (
      participant?.status === "pending" ||
      participant?.status === "approved"
    ) {
      return;
    }

    try {
      setIsApplying(true);

      const data = await applyMeeting(id, user.id);

      setParticipant(data);
    } catch (error) {
      console.error("모임 신청 실패:", error);
      alert("모임 신청 중 오류가 발생했습니다.");
    } finally {
      setIsApplying(false);
    }
  };

  const isApplyDisabled =
    isHost ||
    meeting?.status === "closed" ||
    isFull ||
    isApplying ||
    Boolean(user && hasDisabledStatus);

  const getApplyButtonText = () => {
    if (isHost) {
      return "내가 개설한 모임이에요";
    }

    if (meeting?.status === "closed") {
      return "모집이 완료된 모임이에요";
    }

    if (isApplying) {
      return "신청 중...";
    }

    if (!user) {
      return "로그인 후 참가하기";
    }

    switch (participant?.status) {
      case "pending":
        return "참가 승인을 기다리고 있어요";

      case "approved":
        return "참가 중인 모임이에요";

      case "rejected":
        return "다시 신청하기";

      case "cancelled":
      default:
        return "참가 신청하기";
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: meeting?.title,
      text: `${meeting?.title} 모임을 확인해보세요.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      alert("모임 링크가 복사되었습니다.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("공유 실패:", error);
      alert("공유 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    router.push(`/meetings/${meeting?.id}/edit`);
  };

  const handleDelete = async () => {
    if (!meeting) {
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (user.id !== meeting.host?.id) {
      alert("모임 작성자만 삭제할 수 있습니다.");
      return;
    }

    const confirmed = window.confirm("모임을 삭제하시겠어요?");

    if (!confirmed || isDeleting) return;

    try {
      setIsDeleting(true);
      setIsMenuOpen(false);

      await deleteMeeting(meeting.id, user.id);

      alert("모임이 삭제되었습니다.");
      router.replace("/meetings");
      router.refresh();
    } catch (error) {
      console.error("모임 삭제 실패:", error);
      alert("모임 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="pt-8 relative">
      <div className="absolute top-8 right-0" ref={menuRef}>
        {isHost ? (
          <>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="모임 관리 메뉴"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute top-full right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border border-gray-100 bg-white py-1 shadow-md"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  수정하기
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "삭제 중..." : "삭제하기"}
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleShare}
            className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="모임 공유하기"
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </div>
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
            <Button
              variant="solid"
              onClick={handleApply}
              disabled={isApplyDisabled}
            >
              {getApplyButtonText()}
            </Button>
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
          <Button
            variant="solid"
            onClick={handleApply}
            disabled={isApplyDisabled}
          >
            {getApplyButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetailPage;
