import Link from "next/link";
import { redirect } from "next/navigation";
import MeetingHistoryList from "@/features/meetings/components/MeetingHistoryList";
import {
  getAppliedMeetingHistory,
  getCreatedMeetingHistory,
} from "@/features/meetings/api/meetingHistory.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cn } from "@/utils/cn";

export const metadata = { title: "모임 내역 | BookLink" };

interface Props {
  searchParams: Promise<{ tab?: string | string[] }>;
}

export default async function MeetingHistoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab === "created" ? "created" : "applied";
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/mypage/meetings?tab=${tab}`);

  const appliedMeetings = tab === "applied" ? await getAppliedMeetingHistory(user.id) : [];
  const createdMeetings = tab === "created" ? await getCreatedMeetingHistory(user.id) : [];

  return (
    <div className="mx-auto w-full max-w-320 px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-2xl font-bold text-black-800">모임 내역</h1>
      <nav aria-label="모임 내역 구분" className="mt-8 flex justify-center gap-10 border-b border-line-200 sm:gap-20">
        {(["applied", "created"] as const).map((value) => (
          <Link
            key={value}
            href={`/mypage/meetings?tab=${value}`}
            className={cn("border-b-2 px-2 pb-3 text-lg font-bold", tab === value ? "border-black-800 text-black-800" : "border-transparent text-black-300")}
          >
            {value === "applied" ? "참가 신청한 모임" : "내가 생성한 모임"}
          </Link>
        ))}
      </nav>
      <section className="mt-8">
        <MeetingHistoryList key={tab} tab={tab} userId={user.id} appliedMeetings={appliedMeetings} createdMeetings={createdMeetings} />
      </section>
    </div>
  );
}
