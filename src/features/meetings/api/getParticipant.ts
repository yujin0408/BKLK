import { supabase } from "@/lib/supabase/client";

// 신청 여부 조회
export async function getParticipant(meetingId: string, userId: string) {
  const { data, error } = await supabase
    .from("participants")
    .select("id, status")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
