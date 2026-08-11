import { MeetingDetail } from "@/features/meetings/types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getMeetingByIdWithClient(
  client: SupabaseClient,
  id: string,
): Promise<MeetingDetail | null> {
  const { data, error } = await client
    .from("meetings")
    .select(
      `
        id,
        host_user_id,
        book_id,
        title,
        description,
        thumbnail_url,
        meeting_at,
        capacity,
        current_participants,
        status,
        address,
        detail_address,
        region_1depth_name,
        region_2depth_name,
        longitude,
        latitude,
        host:users (
          id,
          nickname,
          profile_image_url,
          description
        ),
        book:books (
          id,
          title,
          author,
          description,
          cover_image_url
        )
      `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .returns<MeetingDetail[]>()
    .maybeSingle();

  if (error) {
    console.error("모임 상세 조회 실패", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    throw new Error("모임 정보를 불러오지 못했습니다.");
  }

  return data;
}
