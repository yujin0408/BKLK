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

// 모임 신청
export async function applyMeeting(meetingId: string, userId: string) {
  const { data, error } = await supabase
    .from("participants")
    .insert({
      meeting_id: meetingId,
      user_id: userId,
      status: "pending",
      applied_at: new Date().toISOString(),
    })
    .select("id, status")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
