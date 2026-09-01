import MeetingForm from "../components/MeetingForm";
import { getSelectedBook } from "@/features/books/api/book.server";

interface Props {
  searchParams: Promise<{ bookId?: string | string[] }>;
}

async function CreateMeetingPage({ searchParams }: Props) {
  const { bookId: rawBookId } = await searchParams;
  const bookId =
    typeof rawBookId === "string" && isUuid(rawBookId) ? rawBookId : null;
  const initialBook = bookId ? await getSelectedBook(bookId) : null;

  return (
    <div className="pt-8">
      <MeetingForm key={initialBook?.id ?? "empty"} initialBook={initialBook} />
    </div>
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default CreateMeetingPage;
