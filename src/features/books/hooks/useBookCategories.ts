import { useQuery } from "@tanstack/react-query";
import { getBookCategories } from "@/features/books/api/book";

export function useBookCategories() {
  return useQuery({
    queryKey: ["books", "categories"],
    queryFn: getBookCategories,
    staleTime: 1000 * 60 * 30,
  });
}
