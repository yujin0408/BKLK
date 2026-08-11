import { notFound, redirect } from "next/navigation";
import MeetingForm from "../../components/MeetingForm";
import { getMeetingByIdOnServer } from "@/features/meetings/api/meetings.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import toMeetingFormInitialData from "@/features/meetings/utils/toMeetingFormInitialData";

interface EditMeetingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMeetingPage({
  params,
}: EditMeetingPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(`/meetings/${id}/edit`)}`,
    );
  }

  const meeting = await getMeetingByIdOnServer(id);

  if (!meeting) {
    notFound();
  }

  if (meeting.host_user_id !== user.id) {
    redirect(`/meetings/${id}`);
  }

  const initialData = toMeetingFormInitialData(meeting);

  return <MeetingForm mode="edit" meetingId={id} initialData={initialData} />;
}
