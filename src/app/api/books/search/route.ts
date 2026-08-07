import type { AladinBookItem } from "@/features/books/types";
import { mapAladinBookItem } from "@/features/books/utils/mapAladinBook";
import { NextRequest, NextResponse } from "next/server";

const ALADIN_SEARCH_URL = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

interface AladinSearchResponse {
  totalResults?: number;
  startIndex?: number;
  itemsPerPage?: number;
  item?: unknown;
  errorCode?: number | string;
  errorMessage?: string;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      { message: "검색어를 입력해 주세요." },
      { status: 400 },
    );
  }

  const ttbKey = process.env.ALADIN_TTB_KEY;

  if (!ttbKey) {
    return NextResponse.json(
      { message: "서버 설정이 누락되었습니다." },
      { status: 500 },
    );
  }

  const searchParams = new URLSearchParams({
    TTBKey: ttbKey,
    Query: query,
    QueryType: "Keyword",
    MaxResults: "20",
    Start: "1",
    SearchTarget: "Book",
    Output: "JS",
    Version: "20131101",
    Cover: "Big",
  });

  try {
    const response = await fetch(
      `${ALADIN_SEARCH_URL}?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
        },
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Aladin search HTTP error", {
        status: response.status,
        body: responseText.slice(0, 500),
      });

      return NextResponse.json(
        { message: "도서 검색에 실패했습니다." },
        { status: 502 },
      );
    }

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      console.error("Aladin search JSON parse error", {
        error,
        contentType: response.headers.get("content-type"),
        body: responseText.slice(0, 500),
      });

      return NextResponse.json(
        { message: "외부 응답 파싱에 실패했습니다." },
        { status: 502 },
      );
    }

    if (!isAladinSearchResponse(parsedData)) {
      console.error("Invalid Aladin search response", parsedData);

      return NextResponse.json(
        { message: "올바르지 않은 도서 검색 응답입니다." },
        { status: 502 },
      );
    }

    if (parsedData.errorCode || parsedData.errorMessage) {
      console.error("Aladin search API error", {
        errorCode: parsedData.errorCode,
        errorMessage: parsedData.errorMessage,
      });

      return NextResponse.json(
        { message: "도서 검색에 실패했습니다." },
        { status: 502 },
      );
    }

    const items = Array.isArray(parsedData.item)
      ? parsedData.item.filter(isAladinBookItem)
      : [];

    const books = items
      .map(mapAladinBookItem)
      .filter((book) => book.aladinItemId > 0);

    return NextResponse.json({
      books,
      totalResults:
        typeof parsedData.totalResults === "number"
          ? parsedData.totalResults
          : books.length,
    });
  } catch (error) {
    console.error("Aladin search handler error", error);

    return NextResponse.json(
      { message: "도서 검색 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }
}

function isAladinSearchResponse(value: unknown): value is AladinSearchResponse {
  return typeof value === "object" && value !== null;
}

function isAladinBookItem(value: unknown): value is AladinBookItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "itemId" in value &&
    typeof value.itemId === "number" &&
    "title" in value &&
    typeof value.title === "string" &&
    "author" in value &&
    typeof value.author === "string"
  );
}
