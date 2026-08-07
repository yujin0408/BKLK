"use client";

import { FormEvent, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationSearchResult } from "@/features/locations/types";

interface ErrorResponse {
  message?: string;
}

async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const searchParams = new URLSearchParams({
    query,
  });

  const response = await fetch(
    `/api/locations/search?${searchParams.toString()}`,
  );

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(errorData?.message ?? "장소 검색 중 오류가 발생했습니다.");
  }

  return (await response.json()) as LocationSearchResult[];
}

export default function useLocationSearch() {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const query = useQuery({
    queryKey: ["locations", "search", submittedKeyword],
    queryFn: () => searchLocations(submittedKeyword),
    enabled: submittedKeyword.length > 0,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) return;

    setSubmittedKeyword(trimmedKeyword);
  };

  const reset = useCallback(() => {
    setKeyword("");
    setSubmittedKeyword("");
  }, []);

  return {
    keyword,
    setKeyword,
    submittedKeyword,
    submit,
    reset,
    ...query,
  };
}
