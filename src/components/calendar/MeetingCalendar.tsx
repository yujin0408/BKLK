"use client";

import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface MeetingCalendarProps {
  meetingAt: string;
}

function getSeoulCalendarDate(dateString: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(dateString));

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(getPart("year"), getPart("month") - 1, getPart("day"));
}

export default function MeetingCalendar({ meetingAt }: MeetingCalendarProps) {
  const meetingDate = getSeoulCalendarDate(meetingAt);

  return (
    <DayPicker
      mode="single"
      locale={ko}
      selected={meetingDate}
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
