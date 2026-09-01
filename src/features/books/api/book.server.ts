import "server-only";

import type { BookDetail, SelectedBook } from "@/features/books/types";
import { mapMeeting } from "@/features/meetings/mapper/meeting.mapper";
import type { MeetingCardData, MeetingEntity } from "@/features/meetings/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface BookDetailRow {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_image_url: string | null;
  aladin_category_name: string | null;
  publisher: string | null;
  pub_date: string | null;
}

const MEETING_STATUS_ORDER: Record<MeetingEntity["status"], number> = {
  recruiting: 0,
  admission_closing: 1,
  closed: 2,
};

export async function getBookDetail(id: string): Promise<BookDetail | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, author, description, cover_image_url, aladin_category_name, publisher, pub_date",
    )
    .eq("id", id)
    .returns<BookDetailRow[]>()
    .maybeSingle();

  if (error) {
    console.error("책 상세 조회 실패", error);
    throw new Error("책 정보를 불러오지 못했습니다.");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    description: data.description,
    coverImageUrl: data.cover_image_url,
    aladinCategoryName: data.aladin_category_name,
    publisher: data.publisher,
    pubDate: data.pub_date,
  };
}

export async function getSelectedBook(id: string): Promise<SelectedBook | null> {
  const book = await getBookDetail(id);

  if (!book) {
    return null;
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    description: book.description,
  };
}

export async function getBookMeetings(
  bookId: string,
): Promise<MeetingCardData[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("meetings")
    .select(
      "id, title, thumbnail_url, meeting_at, capacity, current_participants, region_1depth_name, region_2depth_name, status",
    )
    .eq("book_id", bookId)
    .is("deleted_at", null)
    .returns<MeetingEntity[]>();

  if (error) {
    console.error("책 관련 모임 조회 실패", error);
    throw new Error("책 모임을 불러오지 못했습니다.");
  }

  return (data ?? [])
    .sort((first, second) => {
      const statusDifference =
        MEETING_STATUS_ORDER[first.status] - MEETING_STATUS_ORDER[second.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return (
        new Date(first.meeting_at).getTime() -
        new Date(second.meeting_at).getTime()
      );
    })
    .map(mapMeeting);
}
