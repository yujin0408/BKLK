import { notFound, redirect } from "next/navigation";
import MeetingForm from "../../components/MeetingForm";
import { getMeetingById } from "@/features/meetings/api/meetings";
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
    redirect(`/login?redirect=/meetings/${id}/edit`);
  }

  let meeting;

  try {
    meeting = await getMeetingById(id);

    if (!meeting) {
      notFound();
    }
  } catch {
    notFound();
  }

  if (meeting.host_user_id !== user.id) {
    redirect(`/meetings/${id}`);
  }

  const initialData = toMeetingFormInitialData(meeting);

  if (!initialData) {
    notFound();
  }

  return (
    <div className="pt-8">
      <MeetingForm mode="edit" meetingId={id} initialData={initialData} />
    </div>
  );
}
