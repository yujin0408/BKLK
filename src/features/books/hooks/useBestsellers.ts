import { useQuery } from "@tanstack/react-query";
import { getBestsellers } from "@/features/books/api/book";

export function useBestsellers() {
  return useQuery({
    queryKey: ["books", "bestsellers"],
    queryFn: getBestsellers,
  });
}
