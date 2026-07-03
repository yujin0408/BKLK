import { supabase } from "@/lib/supabase/client";
import { MeetingCardData } from "../types";
import { mapMeeting } from "../mapper/meeting.mapper";

export const getMeetings = async (): Promise<MeetingCardData[]> => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapMeeting);
};
