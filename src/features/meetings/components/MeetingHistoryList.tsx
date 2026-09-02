"use client";

import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { deleteMeeting } from "@/features/meetings/api/meetings";
import type { AppliedMeetingHistory, CreatedMeetingHistory, PendingParticipant } from "@/features/meetings/api/meetingHistory.server";
import type { MeetingCardData } from "@/features/meetings/types";
import { CalendarDays, MapPin, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const PARTICIPANT_STATUS_LABEL = { pending: "신청 대기", approved: "참가 승인", rejected: "신청 거절" } as const;
const MEETING_STATUS_LABEL = { recruiting: "모집중", admission_closing: "마감임박", closed: "모집완료" } as const;

interface Props {
  tab: "applied" | "created";
  userId: string;
  appliedMeetings: AppliedMeetingHistory[];
  createdMeetings: CreatedMeetingHistory[];
}

interface ParticipantUpdateResponse {
  message?: string;
  currentParticipants?: number;
  meetingStatus?: MeetingCardData["status"];
  isFull?: boolean;
}

export default function MeetingHistoryList({ tab, userId, appliedMeetings, createdMeetings: initialCreatedMeetings }: Props) {
  const router = useRouter();
  const [visibleAppliedMeetings, setVisibleAppliedMeetings] = useState(appliedMeetings);
  const [createdMeetings, setCreatedMeetings] = useState(initialCreatedMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [processingParticipantId, setProcessingParticipantId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [cancellingMeetingId, setCancellingMeetingId] = useState<string | null>(null);
  const selectedMeeting = createdMeetings.find(({ meeting }) => meeting.id === selectedMeetingId);

  const updateParticipant = async (participant: PendingParticipant, status: "approved" | "rejected") => {
    try {
      setProcessingParticipantId(participant.id);
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as ParticipantUpdateResponse;
      if (!response.ok) throw new Error(result.message ?? "신청 처리에 실패했습니다.");

      setCreatedMeetings((meetings) => meetings.map((item) => {
        if (item.meeting.id !== selectedMeetingId) return item;
        const [, capacity = "0"] = item.meeting.capacity.split("/");
        return {
          meeting: {
            ...item.meeting,
            capacity: `${result.currentParticipants ?? 0}/${capacity}`,
            status: result.meetingStatus ?? item.meeting.status,
          },
          pendingParticipants: item.pendingParticipants.filter(({ id }) => id !== participant.id),
          approvedParticipants: status === "approved" ? [...item.approvedParticipants, participant] : item.approvedParticipants,
          rejectedParticipants: status === "rejected" ? [...item.rejectedParticipants, participant] : item.rejectedParticipants,
        };
      }));
      if (status === "approved") {
        alert(
          result.isFull
            ? "참가 신청을 승인했습니다. 모집 인원이 모두 찼습니다."
            : "참가 신청을 승인했습니다.",
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "신청 처리에 실패했습니다.");
    } finally {
      setProcessingParticipantId(null);
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!window.confirm("모임을 삭제하시겠어요?")) return;
    try {
      setDeletingMeetingId(meetingId);
      await deleteMeeting(meetingId, userId);
      setCreatedMeetings((meetings) => meetings.filter(({ meeting }) => meeting.id !== meetingId));
      alert("모임이 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("모임 삭제 실패", error);
      alert("모임 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingMeetingId(null);
    }
  };

  const cancelApplication = async (meetingId: string, participantId: string) => {
    if (!window.confirm("모임 참가 신청을 취소하시겠어요?")) return;
    try {
      setCancellingMeetingId(meetingId);
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const result = (await response.json()) as ParticipantUpdateResponse;
      if (!response.ok) throw new Error(result.message ?? "신청 취소에 실패했습니다.");
      setVisibleAppliedMeetings((meetings) => meetings.filter(({ participantId: id }) => id !== participantId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "신청 취소에 실패했습니다.");
    } finally {
      setCancellingMeetingId(null);
    }
  };

  if (tab === "applied" && visibleAppliedMeetings.length === 0) return <EmptyState type="applied" />;
  if (tab === "created" && createdMeetings.length === 0) return <EmptyState type="created" />;

  return (
    <>
      <div className="space-y-4">
        {tab === "applied" ? visibleAppliedMeetings.map(({ participantId, meeting, participantStatus }) => (
          <HistoryMeetingCard key={participantId} meeting={meeting} right={participantStatus === "pending" ? (
            <Button type="button" variant="outline" size="sm" disabled={cancellingMeetingId === meeting.id} onClick={() => cancelApplication(meeting.id, participantId)}>
              {cancellingMeetingId === meeting.id ? "취소 중" : "신청 취소"}
            </Button>
          ) : <ParticipantStatus status={participantStatus} />} />
        )) : createdMeetings.map(({ meeting, pendingParticipants }) => (
          <HistoryMeetingCard key={meeting.id} meeting={meeting} right={
            <div className="flex flex-wrap justify-end gap-2">
              <Link href={`/meetings/${meeting.id}/edit`} className="inline-flex h-9 items-center rounded-md border border-blue-500 px-3 text-sm font-semibold text-blue-500">수정</Link>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMeetingId(meeting.id)}>신청 관리{pendingParticipants.length > 0 ? ` ${pendingParticipants.length}` : ""}</Button>
              <Button type="button" variant="outline" size="sm" disabled={deletingMeetingId === meeting.id} onClick={() => handleDelete(meeting.id)} className="border-error text-error">{deletingMeetingId === meeting.id ? "삭제 중" : "삭제"}</Button>
            </div>
          } />
        ))}
      </div>

      {selectedMeeting && <ParticipantManagementModal meeting={selectedMeeting} processingParticipantId={processingParticipantId} onClose={() => setSelectedMeetingId(null)} onUpdate={updateParticipant} />}
    </>
  );
}

function HistoryMeetingCard({ meeting, right }: { meeting: MeetingCardData; right: ReactNode }) {
  const detailHref = `/meetings/${meeting.id}`;
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line-100 bg-white p-3 transition hover:shadow-sm sm:flex-row sm:items-stretch">
      <Link href={detailHref} className="h-44 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-40" aria-label={`${meeting.title} 상세 보기`}>
        <img src={meeting.thumbnail || "/card_thumbnail.png"} alt="모임 썸네일" className="h-full w-full object-cover" />
      </Link>
      <Link href={detailHref} className="flex min-w-0 flex-1 flex-col py-1">
        <Badge variant={meeting.status}>{MEETING_STATUS_LABEL[meeting.status]}</Badge>
        <h2 className="mt-3 truncate text-lg font-bold text-black-800">{meeting.title}</h2>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 text-sm text-black-300">
          <span className="flex items-center gap-1"><CalendarDays className="size-4" />{meeting.meetingAt}</span>
          <span className="flex items-center gap-1"><MapPin className="size-4" />{meeting.region}</span>
          <span className="flex items-center gap-1"><User className="size-4" />{meeting.capacity}</span>
        </div>
      </Link>
      <div className="flex shrink-0 items-end justify-end border-t border-line-200 pt-3 sm:w-72 sm:border-t-0 sm:pt-0">{right}</div>
    </article>
  );
}

function ParticipantStatus({ status }: { status: AppliedMeetingHistory["participantStatus"] }) {
  return <span className="rounded-md bg-blue-200 px-3 py-2 text-sm font-semibold text-blue-800">{PARTICIPANT_STATUS_LABEL[status]}</span>;
}

function ParticipantManagementModal({ meeting, processingParticipantId, onClose, onUpdate }: {
  meeting: CreatedMeetingHistory;
  processingParticipantId: string | null;
  onClose: () => void;
  onUpdate: (participant: PendingParticipant, status: "approved" | "rejected") => void;
}) {
  const [currentCount = "0", capacity = "0"] = meeting.meeting.capacity.split("/");
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true" aria-labelledby="participant-modal-title" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="participant-modal-title" className="text-xl font-bold">신청 현황</h2>
            <p className="mt-4 text-sm font-semibold text-black-600">현재 모집 인원 {currentCount}/{capacity} · 신청 인원 {meeting.pendingParticipants.length}명</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-2xl text-black-300">×</button>
        </div>
        <ParticipantSection title="승인 대기" participants={meeting.pendingParticipants} emptyText="대기 중인 참가 신청이 없습니다.">
          {(participant) => (
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" disabled={processingParticipantId !== null || meeting.meeting.status === "closed"} onClick={() => onUpdate(participant, "approved")}>승인</Button>
              <Button type="button" size="sm" variant="outline" disabled={processingParticipantId !== null} onClick={() => onUpdate(participant, "rejected")}>거절</Button>
            </div>
          )}
        </ParticipantSection>
        <ParticipantSection title="승인" participants={meeting.approvedParticipants} emptyText="승인된 참가자가 없습니다." collapsible />
        <ParticipantSection title="거절" participants={meeting.rejectedParticipants} emptyText="거절된 참가자가 없습니다." collapsible />
      </div>
    </div>
  );
}

function ParticipantSection({ title, participants, emptyText, children, collapsible = false }: {
  title: string;
  participants: PendingParticipant[];
  emptyText: string;
  children?: (participant: PendingParticipant) => ReactNode;
  collapsible?: boolean;
}) {
  const content = (
    <>
      {participants.length === 0 ? <p className="py-8 text-center text-sm text-black-300">{emptyText}</p> : (
        <ul className="mt-2 divide-y divide-line-200">
          {participants.map((participant) => (
            <li key={participant.id} className="flex items-center gap-3 py-4">
              <img src={participant.profileImageUrl || "/profile.jpg"} alt="" className="size-12 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{participant.nickname}</p>
                {participant.description && <p className="mt-1 truncate text-sm text-black-300">{participant.description}</p>}
              </div>
              {children?.(participant)}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (collapsible) {
    return (
      <details className="group mt-7 border-t border-line-200 pt-5">
        <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-black-700">
          <span>{title} <span className="text-sm font-normal text-black-300">{participants.length}명</span></span>
          <span className="text-black-300 transition group-open:rotate-180">⌄</span>
        </summary>
        {content}
      </details>
    );
  }

  return (
    <section className="mt-7">
      <h3 className="font-bold text-black-700">{title}</h3>
      {content}
    </section>
  );
}

function EmptyState({ type }: { type: "applied" | "created" }) {
  const isApplied = type === "applied";
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-line-200 px-5 text-center">
      <p className="whitespace-pre-line text-lg font-semibold leading-7 text-black-600">{isApplied ? "아직 신청한 모임이 없어요!\n다른 모임에 참가해보세요." : "아직 생성한 모임이 없어요!\n원하는 책을 골라 모임을 개설해보세요."}</p>
      <Link href={isApplied ? "/meetings" : "/meetings/new"} className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-500 px-4 font-semibold text-white hover:bg-active">{isApplied ? "모임 둘러보기" : "모임 만들기"}</Link>
    </div>
  );
}
