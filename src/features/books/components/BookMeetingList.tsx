"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import MeetingCard from "@/components/common/MeetingCard";
import BookDetailActions from "@/features/books/components/BookDetailActions";
import type { MeetingCardData } from "@/features/meetings/types";

const INITIAL_MEETING_COUNT = 4;

interface Props {
  bookId: string;
  bookTitle: string;
  meetings: MeetingCardData[];
}

export default function BookMeetingList({
  bookId,
  bookTitle,
  meetings,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleMeetings = showAll
    ? meetings
    : meetings.slice(0, INITIAL_MEETING_COUNT);

  return (
    <section className="mt-14 border-t border-line-200 pt-8">
      <h2 className="text-xl font-bold text-black-800">이 책 모임</h2>
      <p className="mt-1 text-sm text-black-300">
        이 책을 함께 읽을 사람들을 만나보세요.
      </p>

      {meetings.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {visibleMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} data={meeting} />
            ))}
          </div>
          {meetings.length > INITIAL_MEETING_COUNT && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAll((current) => !current)}
              >
                {showAll ? "모임 접기" : "모임 더보기"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-line-100 bg-bg-blue px-5 text-center">
          <p className="font-semibold text-black-800">
            아직 이 책으로 열린 모임이 없어요.
          </p>
          <p className="mt-2 text-sm text-black-300">
            이 책을 함께 읽을 사람들을 만나보세요.
          </p>
          <div className="mt-5">
            <BookDetailActions
              bookId={bookId}
              title={bookTitle}
              createMeetingOnly
            />
          </div>
        </div>
      )}
    </section>
  );
}
