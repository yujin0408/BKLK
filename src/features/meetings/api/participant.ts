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
  const { data: existingParticipant, error: lookupError } = await supabase
    .from("participants")
    .select("id, status")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existingParticipant) {
    if (existingParticipant.status !== "cancelled") {
      const statusMessage =
        existingParticipant.status === "rejected"
          ? "거절된 신청은 다시 신청할 수 없습니다."
          : "이미 신청한 모임입니다.";

      throw new Error(statusMessage);
    }

    const { count, error: updateError } = await supabase
      .from("participants")
      .update(
        {
          status: "pending",
          responded_at: null,
          applied_at: new Date().toISOString(),
        },
        { count: "exact" },
      )
      .eq("id", existingParticipant.id)
      .eq("meeting_id", meetingId)
      .eq("user_id", userId)
      .eq("status", "cancelled");

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (count !== 1) {
      throw new Error("신청 상태가 변경되었습니다. 새로고침 후 다시 시도해주세요.");
    }

    return { id: existingParticipant.id, status: "pending" as const };
  }

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
