// src/app/page.tsx
"use client";

import MeetingCard from "@/components/common/MeetingCard";
import { getMeetings } from "@/features/meetings/api/getMeetings";
import { MeetingCardData } from "@/features/meetings/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [meetings, setMeetings] = useState<MeetingCardData[]>([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetings();
        setMeetings(response);
      } catch (error) {
        console.error("모임 조회 실패", error);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className="w-full pt-5">
      <h1 className="text-2xl font-bold text-gray-800">BEST 인기모임</h1>
      <div className="flex justify-between">
        <p className="mt-2 text-gray-600">
          실시간으로 주목받는 인기 모임 리스트!
        </p>
        <a href="/meetings" className="text-xs flex items-center gap-1">
          <Plus className="size-3" />
          모임 더보기
        </a>
      </div>
      <div className="flex gap-6 mt-6">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} data={meeting} />
        ))}
      </div>
    </div>
  );
}
