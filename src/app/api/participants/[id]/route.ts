import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface StatusPayload {
  status?: unknown;
}

interface ApprovalResult {
  currentParticipants: number;
  meetingStatus: "recruiting" | "admission_closing" | "closed";
  isFull: boolean;
}

function isApprovalResult(value: unknown): value is ApprovalResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;
  return (
    typeof result.currentParticipants === "number" &&
    (result.meetingStatus === "recruiting" ||
      result.meetingStatus === "admission_closing" ||
      result.meetingStatus === "closed") &&
    typeof result.isFull === "boolean"
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = (await request.json()) as StatusPayload;

  if (
    payload.status !== "approved" &&
    payload.status !== "rejected" &&
    payload.status !== "cancelled"
  ) {
    return NextResponse.json(
      { message: "처리 상태가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  if (payload.status === "approved") {
    const { data, error } = await supabase.rpc(
      "approve_meeting_participant",
      { target_participant_id: id },
    );

    if (error) {
      console.error("참가 신청 승인 RPC 실패", error);
      const isConflict = error.code === "P0001" || error.code === "P0002";
      const message = error.message.includes("모집이 완료된 모임")
        ? "이미 모집이 완료된 모임입니다."
        : error.message || "참가 신청 승인에 실패했습니다.";
      return NextResponse.json(
        { message },
        { status: isConflict ? 409 : 500 },
      );
    }

    const result: unknown = data;
    if (!isApprovalResult(result)) {
      console.error("참가 신청 승인 RPC 응답 형식 오류", result);
      return NextResponse.json(
        { message: "참가 신청 승인 결과를 확인하지 못했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "approved", ...result });
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select(
      "id, user_id, status, meeting_id, meetings!inner(id, host_user_id, capacity, current_participants, status, deleted_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (participantError) {
    console.error("참가 신청 조회 실패", participantError);
    return NextResponse.json(
      { message: "신청 정보를 확인하지 못했습니다." },
      { status: 500 },
    );
  }

  const meetingValue = participant?.meetings;
  const meeting = Array.isArray(meetingValue) ? meetingValue[0] : meetingValue;

  if (!participant || !meeting || meeting.deleted_at) {
    return NextResponse.json(
      { message: "신청 정보를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isCancellation = payload.status === "cancelled";

  if (isCancellation && participant.user_id !== authData.user.id) {
    return NextResponse.json(
      { message: "본인의 신청만 취소할 수 있습니다." },
      { status: 403 },
    );
  }

  if (!isCancellation && meeting.host_user_id !== authData.user.id) {
    return NextResponse.json(
      { message: "신청을 관리할 권한이 없습니다." },
      { status: 403 },
    );
  }

  if (participant.status !== "pending") {
    return NextResponse.json(
      { message: "이미 처리된 신청입니다." },
      { status: 409 },
    );
  }

  const respondedAt = new Date().toISOString();

  const { count: participantUpdateCount, error: updateError } = await supabase
    .from("participants")
    .update(
      {
        status: payload.status,
        responded_at: respondedAt,
      },
      { count: "exact" },
    )
    .eq("id", id)
    .eq("status", "pending");

  if (updateError) {
    console.error("참가 신청 상태 변경 실패", updateError);

    return NextResponse.json(
      { message: "참가 신청 상태를 변경하지 못했습니다." },
      { status: 500 },
    );
  }

  if (participantUpdateCount !== 1) {
    return NextResponse.json(
      {
        message: "이미 처리된 신청이거나 participants UPDATE 권한이 없습니다.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    status: payload.status,
    currentParticipants: meeting.current_participants,
    meetingStatus: meeting.status,
    isFull: meeting.current_participants >= meeting.capacity,
  });
}
