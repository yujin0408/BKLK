import MeetingForm from "../components/MeetingForm";
import { getSelectedBook } from "@/features/books/api/book.server";

interface Props {
  searchParams: Promise<{ bookId?: string }>;
}

async function CreateMeetingPage({ searchParams }: Props) {
  const { bookId } = await searchParams;
  const initialBook = bookId ? await getSelectedBook(bookId) : null;

  return (
    <div className="pt-8">
      <MeetingForm initialBook={initialBook} />
    </div>
  );
}

export default CreateMeetingPage;
