// src/app/page.tsx
"use client";

import MeetingCard from "@/components/common/MeetingCard";
import { getMeetings } from "@/features/meetings/api/getMeetings";
import { MeetingCardData } from "@/features/meetings/types";
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
    <main>
      <h1>BookLink</h1>
      <div className="flex gap-3">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} data={meeting} />
        ))}
      </div>
    </main>
  );
}
