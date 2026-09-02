import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  LibraryRecentBook,
  LibraryStatus,
  MyPageData,
  MyPageProfile,
} from "@/features/mypage/types";

interface UserRow {
  id: string;
  nickname: string;
  profile_image_url: string | null;
  description: string | null;
}

interface LibraryRow {
  books: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
  } | null;
}

const LIBRARY_SECTIONS: ReadonlyArray<{
  status: LibraryStatus;
  label: string;
}> = [
  { status: "reading", label: "읽는 중" },
  { status: "wish", label: "읽고 싶은" },
  { status: "finished", label: "다 읽은" },
];

export async function getMyPageData(userId: string): Promise<MyPageData> {
  const supabase = await createServerSupabaseClient();

  const profilePromise = supabase
    .from("users")
    .select("id, nickname, profile_image_url, description")
    .eq("id", userId)
    .returns<UserRow[]>()
    .single();

  const appliedCountPromise = supabase
    .from("participants")
    .select("id, meetings!inner(id)", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pending", "approved"])
    .is("meetings.deleted_at", null);

  const hostedCountPromise = supabase
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .eq("host_user_id", userId)
    .is("deleted_at", null);

  const libraryPromises = LIBRARY_SECTIONS.map(async ({ status, label }) => {
    const [countResult, recentResult] = await Promise.all([
      supabase
        .from("my_library")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", status)
        .is("deleted_at", null),
      supabase
        .from("my_library")
        .select("books(id, title, author, cover_image_url)")
        .eq("user_id", userId)
        .eq("status", status)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .returns<LibraryRow[]>()
        .maybeSingle(),
    ]);

    if (countResult.error || recentResult.error) {
      console.error("내 서재 요약 조회 실패", {
        status,
        countError: countResult.error,
        recentError: recentResult.error,
      });
      throw new Error("내 서재 정보를 불러오지 못했습니다.");
    }

    const book = recentResult.data?.books;
    const recentBook: LibraryRecentBook | null = book
      ? {
          id: book.id,
          title: book.title,
          author: book.author,
          coverImageUrl: book.cover_image_url,
        }
      : null;

    return { status, label, count: countResult.count ?? 0, recentBook };
  });

  const [profileResult, appliedResult, hostedResult, library] =
    await Promise.all([
      profilePromise,
      appliedCountPromise,
      hostedCountPromise,
      Promise.all(libraryPromises),
    ]);

  if (profileResult.error || !profileResult.data) {
    console.error("마이페이지 프로필 조회 실패", profileResult.error);
    throw new Error("프로필 정보를 불러오지 못했습니다.");
  }

  if (appliedResult.error || hostedResult.error) {
    console.error("마이페이지 모임 개수 조회 실패", {
      appliedError: appliedResult.error,
      hostedError: hostedResult.error,
    });
    throw new Error("모임 내역을 불러오지 못했습니다.");
  }

  const row = profileResult.data;
  const profile: MyPageProfile = {
    id: row.id,
    nickname: row.nickname,
    profileImageUrl: row.profile_image_url,
    description: row.description,
  };

  return {
    profile,
    meetingCounts: {
      applied: appliedResult.count ?? 0,
      hosted: hostedResult.count ?? 0,
    },
    library,
  };
}
