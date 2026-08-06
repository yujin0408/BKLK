import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBook } from "@/features/books/api/book";
import { CreateBookInput, SelectedBook } from "@/features/books/types";

export function useSaveBook() {
  const qc = useQueryClient();

  return useMutation<SelectedBook, Error, CreateBookInput>({
    mutationFn: saveBook,
    onSuccess: (data) => {
      // invalidate any relevant caches
      qc.invalidateQueries(["books"]);
      qc.invalidateQueries(["books", "bestsellers"]);
    },
  });
}
