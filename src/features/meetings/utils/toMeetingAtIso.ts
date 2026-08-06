export default function toMeetingAtIso(
  meetingDate: Date,
  meetingTime: string,
): string {
  const [hourString, minuteString] = meetingTime.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("모임 시간이 올바르지 않습니다.");
  }

  const year = meetingDate.getFullYear();
  const month = String(meetingDate.getMonth() + 1).padStart(2, "0");
  const day = String(meetingDate.getDate()).padStart(2, "0");
  const formattedHour = String(hour).padStart(2, "0");
  const formattedMinute = String(minute).padStart(2, "0");

  return new Date(
    `${year}-${month}-${day}T${formattedHour}:${formattedMinute}:00+09:00`,
  ).toISOString();
}
