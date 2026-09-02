import { redirect } from "next/navigation";
import ProfileEditor from "@/features/mypage/components/ProfileEditor";
import LibrarySummary from "@/features/mypage/components/LibrarySummary";
import { getMyPageData } from "@/features/mypage/api/mypage.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "마이페이지 | BookLink",
};

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/mypage");
  }

  const data = await getMyPageData(user.id);

  return (
    <div className="mx-auto w-full max-w-300 space-y-6 px-5 py-10 sm:px-8 sm:py-14">
      <ProfileEditor initialProfile={data.profile} />

      <section aria-labelledby="meetings-heading" className="rounded-2xl border border-line-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 id="meetings-heading" className="text-2xl font-bold text-black-800">모임 내역</h2>
          <Link href="/mypage/meetings" className="text-sm font-semibold text-brand-primary hover:underline">전체보기</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
          <Link href="/mypage/meetings?tab=applied" className="flex items-center justify-between rounded-xl border border-line-200 px-4 py-5 transition hover:shadow-sm sm:px-7">
            <span className="font-semibold text-black-600">신청 모임</span>
            <strong className="text-2xl text-brand-primary">{data.meetingCounts.applied}</strong>
          </Link>
          <Link href="/mypage/meetings?tab=created" className="flex items-center justify-between rounded-xl border border-line-200 px-4 py-5 transition hover:shadow-sm sm:px-7">
            <span className="font-semibold text-black-600">개설 모임</span>
            <strong className="text-2xl text-brand-primary">{data.meetingCounts.hosted}</strong>
          </Link>
        </div>
      </section>

      <LibrarySummary items={data.library} />
    </div>
  );
}
