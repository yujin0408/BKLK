"use client";

import { Bookmark, Share2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { supabase } from "@/lib/supabase/client";

interface Props {
  bookId: string;
  title: string;
  createMeetingOnly?: boolean;
}

export default function BookDetailActions({
  bookId,
  title,
  createMeetingOnly = false,
}: Props) {
  const router = useRouter();
  const meetingPath = `/meetings/new?bookId=${encodeURIComponent(bookId)}`;

  const requireLogin = async (redirect: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return false;
    }

    return true;
  };

  const handleCreateMeeting = async () => {
    if (await requireLogin(meetingPath)) {
      router.push(meetingPath);
    }
  };

  const handleBookshelf = async () => {
    if (await requireLogin(`/books/${bookId}`)) {
      alert("내 서재 기능은 준비 중입니다.");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${title} 책 정보를 확인해보세요.`,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      alert("책 링크가 복사되었습니다.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("책 공유 실패", error);
      alert("공유 중 오류가 발생했습니다.");
    }
  };

  if (createMeetingOnly) {
    return (
      <Button type="button" size="sm" onClick={handleCreateMeeting}>
        첫 모임 만들기
      </Button>
    );
  }

  return (
    <div className="mt-7 flex flex-wrap gap-2.5">
      <Button
        type="button"
        size="sm"
        onClick={handleCreateMeeting}
        leftIcon={<Users className="size-4" aria-hidden="true" />}
      >
        모임 만들기
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleBookshelf}
        leftIcon={<Bookmark className="size-4" aria-hidden="true" />}
      >
        내 서재 담기
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleShare}
        leftIcon={<Share2 className="size-4" aria-hidden="true" />}
      >
        공유하기
      </Button>
    </div>
  );
}
