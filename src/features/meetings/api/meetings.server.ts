import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMeetingByIdWithClient } from "./meetingDetail";

export async function getMeetingByIdOnServer(id: string) {
  const supabase = await createServerSupabaseClient();

  return getMeetingByIdWithClient(supabase, id);
}
