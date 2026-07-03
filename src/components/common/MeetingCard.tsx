import Badge from "./Badge";

const STATUS_LABEL = {
  recruiting: "모집중",
  admission_closing: "마감 임박",
  closed: "모집완료",
} as const;

function MeetingCard({
  data,
}: {
  data: {
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
    <div className="rounded-xl border border-line-100 px-3 py-2.5">
      <div className="h-[180px] w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={thumbnailSrc}
          alt="썸네일 이미지"
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <div>
          <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
          <span>{data.capacity}</span>
        </div>

        <p>{data.title}</p>

        <div>
          <span>{data.meetingAt}</span>
          <span>{data.region}</span>
        </div>
      </div>
    </div>
  );
}

export default MeetingCard;
