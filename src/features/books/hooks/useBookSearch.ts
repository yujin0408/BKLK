import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchBooks } from "@/features/books/api/book";

export function useBookSearch() {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["books", "search", submittedKeyword],
    queryFn: () => (submittedKeyword ? searchBooks(submittedKeyword) : []),
    enabled: !!submittedKeyword,
  });

  const submit = (k?: string) => {
    const q = k ?? keyword;
    if (!q || q.trim() === "") return;
    setSubmittedKeyword(q.trim());
  };

  const reset = () => {
    setKeyword("");
    setSubmittedKeyword(null);
  };

  return {
    keyword,
    setKeyword,
    submittedKeyword,
    submit,
    reset,
    ...query,
  } as const;
}
