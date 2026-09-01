import { useMutation } from "@tanstack/react-query";
import { saveBook } from "@/features/books/api/book";
import { CreateBookInput, SelectedBook } from "@/features/books/types";

export function useSaveBook() {
  return useMutation<SelectedBook, Error, CreateBookInput>({
    mutationFn: saveBook,
  });
}
