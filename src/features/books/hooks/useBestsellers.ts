import { useQuery } from "@tanstack/react-query";
import { getBestsellers } from "@/features/books/api/book";

export function useBestsellers(category = "bestseller") {
  return useQuery({
    queryKey: ["books", "bestsellers", category],
    queryFn: () => getBestsellers(category),
  });
}
