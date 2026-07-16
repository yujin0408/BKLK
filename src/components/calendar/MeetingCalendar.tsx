"use client";

import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface MeetingCalendarProps {
  meetingAt: string;
}

export default function MeetingCalendar({ meetingAt }: MeetingCalendarProps) {
  const meetingDate = new Date(meetingAt);

  return (
    <DayPicker
      mode="single"
      locale={ko}
      selected={meetingDate}
      defaultMonth={meetingDate}
      month={meetingDate}
      hideNavigation
      disableNavigation
      modifiers={{
        meeting: meetingDate,
      }}
      modifiersClassNames={{
        meeting: "bg-brand-primary text-white font-bold rounded-full",
      }}
    />
  );
}
