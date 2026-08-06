import { NextResponse } from "next/server";
import type { AladinBookItem } from "@/features/books/types";
import { mapAladinBookItem } from "@/features/books/utils/mapAladinBook";

const ALADIN_BESTSELLER_URL = "https://www.aladin.co.kr/ttb/api/ItemList.aspx";

interface AladinBestsellerResponse {
  totalResults?: number;
  startIndex?: number;
  itemsPerPage?: number;
  item?: unknown;
  errorCode?: number | string;
  errorMessage?: string;
}

export async function GET() {
  const ttbKey = process.env.ALADIN_TTB_KEY;

  if (!ttbKey) {
    return NextResponse.json(
      { message: "서버에 필요한 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const url = new URL(ALADIN_BESTSELLER_URL);

  url.searchParams.set("TTBKey", ttbKey);
  url.searchParams.set("QueryType", "Bestseller");
  url.searchParams.set("SearchTarget", "Book");
  url.searchParams.set("Output", "JS");
  url.searchParams.set("Version", "20131101");
  url.searchParams.set("Cover", "Big");
  url.searchParams.set("MaxResults", "40");
  url.searchParams.set("Start", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Aladin bestseller HTTP error", {
        status: response.status,
        body: responseText.slice(0, 500),
      });

      return NextResponse.json(
        { message: "외부 베스트셀러 서비스에 문제가 발생했습니다." },
        { status: 502 },
      );
    }

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      console.error("Aladin bestseller JSON parse error", {
        error,
        contentType: response.headers.get("content-type"),
        body: responseText.slice(0, 500),
      });

      return NextResponse.json(
        { message: "외부 응답 파싱에 실패했습니다." },
        { status: 502 },
      );
    }

    if (!isAladinBestsellerResponse(parsedData)) {
      console.error("Invalid Aladin bestseller response", parsedData);

      return NextResponse.json(
        { message: "올바르지 않은 베스트셀러 응답입니다." },
        { status: 502 },
      );
    }

    if (parsedData.errorCode || parsedData.errorMessage) {
      console.error("Aladin bestseller API error", {
        errorCode: parsedData.errorCode,
        errorMessage: parsedData.errorMessage,
      });

      return NextResponse.json(
        { message: "베스트셀러 조회에 실패했습니다." },
        { status: 502 },
      );
    }

    const items = Array.isArray(parsedData.item)
      ? parsedData.item.filter(isAladinBookItem)
      : [];

    const books = items
      .map(mapAladinBookItem)
      .filter((book) => book.aladinItemId > 0);

    return NextResponse.json(
      {
        books,
        totalResults:
          typeof parsedData.totalResults === "number"
            ? parsedData.totalResults
            : books.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Aladin bestseller handler error", error);

    return NextResponse.json(
      { message: "베스트셀러 조회 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }
}

function isAladinBestsellerResponse(
  value: unknown,
): value is AladinBestsellerResponse {
  return typeof value === "object" && value !== null;
}

function isAladinBookItem(value: unknown): value is AladinBookItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "itemId" in value &&
    (typeof value.itemId === "number" || typeof value.itemId === "string") &&
    "title" in value &&
    typeof value.title === "string" &&
    "author" in value &&
    typeof value.author === "string"
  );
}
