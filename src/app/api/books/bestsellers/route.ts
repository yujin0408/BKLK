import { NextResponse } from "next/server";
import { AladinBookResponse } from "@/features/books/types";
import mapAladinBookItem from "@/features/books/utils/mapAladinBook";

const ALADIN_TTB_KEY = process.env.ALADIN_TTB_KEY;

export async function GET() {
  if (!ALADIN_TTB_KEY) {
    return NextResponse.json(
      { message: "서버에 필요한 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const url = new URL("https://www.aladin.co.kr/ttb/api/ItemList.aspx");
  url.searchParams.set("ttbkey", ALADIN_TTB_KEY);
  url.searchParams.set("QueryType", "Bestseller");
  url.searchParams.set("SearchTarget", "Book");
  url.searchParams.set("Output", "JS");
  url.searchParams.set("MaxResults", "40");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json(
        { message: "외부 베스트셀러 서비스에 문제가 발생했습니다." },
        { status: 502 },
      );
    }

    const text = await res.text();
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return NextResponse.json(
        { message: "외부 응답 파싱 실패." },
        { status: 502 },
      );
    }

    const jsonText = text.slice(firstBrace, lastBrace + 1);

    let parsed: AladinBookResponse;
    try {
      parsed = JSON.parse(jsonText) as AladinBookResponse;
    } catch {
      return NextResponse.json(
        { message: "외부 응답 파싱 실패." },
        { status: 502 },
      );
    }

    const items = parsed.item ?? [];
    const results = items.map((it) => mapAladinBookItem(it));

    return NextResponse.json(results, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "베스트셀러 조회 중 오류가 발생했습니다." },
      { status: 502 },
    );
  }
}
