"use client";

import MeetingCard from "@/components/common/MeetingCard";
import SearchInput from "@/components/common/SearchInput";
import { getMeetings } from "@/features/meetings/api/getMeetings";
import { MeetingCardData } from "@/features/meetings/types";
import { useEffect, useState } from "react";

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingCardData[]>([]);
  const [keyword, setKeyword] = useState("");

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
      <SearchInput
        value={keyword}
        onChange={setKeyword}
        placeholder="모임을 검색해보세요"
      />
      <div>
        <div></div>
        <div></div>
      </div>
      <div className="flex gap-6 mt-6">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} data={meeting} />
        ))}
      </div>
    </div>
  );
}
