import { User, CalendarDays, MapPin } from "lucide-react";
import Badge from "./Badge";
import Link from "next/link";

const STATUS_LABEL = {
  recruiting: "모집중",
  admission_closing: "마감임박",
  closed: "모집완료",
} as const;

function MeetingCard({
  data,
}: {
  data: {
    id: string;
    title: string;
    region: string;
    capacity: string;
    meetingAt: string;
    thumbnail?: string | null;
    status?: "recruiting" | "admission_closing" | "closed";
  };
}) {
  const thumbnailSrc = data.thumbnail || "/default-thumbnail.png";
  const status = data.status ?? "recruiting";

  return (
    <Link
      href={`/meetings/${data.id}`}
      className="block rounded-xl border border-line-100 px-3 py-2.5 transition hover:shadow-sm"
    >
      <div className="h-45 w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={thumbnailSrc}
          alt="썸네일 이미지"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm items-center">
          <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
          <span className="flex gap-1 items-center">
            <User className="size-4" />
            {data.capacity}
          </span>
        </div>

        <p className="mt-3">{data.title}</p>

        <div className="mt-2.5 flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="relative top-[-1px] size-4 shrink-0 text-gray-500" />
            <span>{data.meetingAt}</span>
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="size-4 shrink-0 text-gray-500" />
            <span>{data.region}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default MeetingCard;
