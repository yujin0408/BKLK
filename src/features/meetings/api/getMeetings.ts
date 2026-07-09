import { supabase } from "@/lib/supabase/client";
import { MeetingCardData } from "../types";
import { mapMeeting } from "../mapper/meeting.mapper";

type GetMeetingsParams = {
  region_1depth_name?: string;
  region_2depth_name?: string;
};

export const getMeetings = async (
  params?: GetMeetingsParams,
): Promise<MeetingCardData[]> => {
  let query = supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.region_1depth_name && params.region_1depth_name !== "전체") {
    query = query.eq("region_1depth_name", params.region_1depth_name);
  }

  if (params?.region_2depth_name && params.region_2depth_name !== "전체") {
    query = query.eq("region_2depth_name", params.region_2depth_name);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map(mapMeeting);
};
