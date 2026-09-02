import "server-only";

import { mapMeeting } from "@/features/meetings/mapper/meeting.mapper";
import type { MeetingCardData, MeetingEntity } from "@/features/meetings/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ParticipantStatus = "pending" | "approved" | "rejected" | "cancelled";

interface AppliedMeetingRow {
  id: string;
  status: ParticipantStatus;
  meetings: MeetingEntity | null;
}

interface ParticipantRow {
  id: string;
  user_id: string;
  status: ParticipantStatus;
  users: {
    nickname: string;
    profile_image_url: string | null;
    description: string | null;
  } | null;
}

interface CreatedMeetingRow extends MeetingEntity {
  participants: ParticipantRow[] | null;
}

export interface AppliedMeetingHistory {
  participantId: string;
  participantStatus: Exclude<ParticipantStatus, "cancelled">;
  meeting: MeetingCardData;
}

export interface PendingParticipant {
  id: string;
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  description: string | null;
}

export interface CreatedMeetingHistory {
  meeting: MeetingCardData;
  pendingParticipants: PendingParticipant[];
  approvedParticipants: PendingParticipant[];
  rejectedParticipants: PendingParticipant[];
}

const MEETING_FIELDS = `
  id,
  title,
  thumbnail_url,
  meeting_at,
  capacity,
  current_participants,
  region_1depth_name,
  region_2depth_name,
  status
`;

export async function getAppliedMeetingHistory(
  userId: string,
): Promise<AppliedMeetingHistory[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("participants")
    .select(`id, status, meetings!inner(${MEETING_FIELDS})`)
    .eq("user_id", userId)
    .in("status", ["pending", "approved", "rejected"])
    .is("meetings.deleted_at", null)
    .order("applied_at", { ascending: false })
    .returns<AppliedMeetingRow[]>();

  if (error) {
    console.error("신청한 모임 내역 조회 실패", error);
    throw new Error("신청한 모임을 불러오지 못했습니다.");
  }

  return (data ?? []).flatMap((row) =>
    row.meetings
      ? [{ participantId: row.id, participantStatus: row.status as Exclude<ParticipantStatus, "cancelled">, meeting: mapMeeting(row.meetings) }]
      : [],
  );
}

export async function getCreatedMeetingHistory(
  userId: string,
): Promise<CreatedMeetingHistory[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("meetings")
    .select(`${MEETING_FIELDS}, participants(id, user_id, status, users(nickname, profile_image_url, description))`)
    .eq("host_user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<CreatedMeetingRow[]>();

  if (error) {
    console.error("생성한 모임 내역 조회 실패", error);
    throw new Error("생성한 모임을 불러오지 못했습니다.");
  }

  return (data ?? []).map((row) => {
    const toParticipant = (participant: ParticipantRow): PendingParticipant => ({
        id: participant.id,
        userId: participant.user_id,
        nickname: participant.users?.nickname ?? "사용자",
        profileImageUrl: participant.users?.profile_image_url ?? null,
        description: participant.users?.description ?? null,
      });

    return {
      meeting: mapMeeting(row),
      pendingParticipants: (row.participants ?? [])
        .filter((participant) => participant.status === "pending")
        .map(toParticipant),
      approvedParticipants: (row.participants ?? [])
        .filter((participant) => participant.status === "approved")
        .map(toParticipant),
      rejectedParticipants: (row.participants ?? [])
        .filter((participant) => participant.status === "rejected")
        .map(toParticipant),
    };
  });
}
