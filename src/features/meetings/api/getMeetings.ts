import { supabase } from "@/lib/supabase/client";
import { mapMeeting } from "../mapper/meeting.mapper";

interface GetMeetingsParams {
  keyword?: string;
  status?: string;
  date?: string;
  region_1depth_name?: string;
  region_2depth_name?: string;
}

export async function getMeetings(params: GetMeetingsParams = {}) {
  let query = supabase.from("meetings").select("*");

  if (params.keyword) {
    query = query.ilike("title", `%${params.keyword}%`);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.date) {
    const start = new Date(`${params.date}T00:00:00+09:00`);
    const end = new Date(`${params.date}T23:59:59.999+09:00`);

    query = query
      .gte("meeting_at", start.toISOString())
      .lte("meeting_at", end.toISOString());
  }

  if (params.region_1depth_name) {
    query = query.eq("region_1depth_name", params.region_1depth_name);
  }

  if (params.region_2depth_name) {
    query = query.eq("region_2depth_name", params.region_2depth_name);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase 모임 조회 오류:", error);
    throw error;
  }

  return (data ?? []).map(mapMeeting);
}
