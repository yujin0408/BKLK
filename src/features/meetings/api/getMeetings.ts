import { supabase } from "@/lib/supabase/client";
import type { Meeting } from "../types";

export const getMeetings = async (): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};
