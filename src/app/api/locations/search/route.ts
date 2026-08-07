import { NextRequest, NextResponse } from "next/server";
import {
  KakaoPlaceSearchResponse,
  LocationSearchResult,
} from "@/features/locations/types";
import mapKakaoPlace from "@/features/locations/utils/mapKakaoPlace";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

const KAKAO_PLACE_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/keyword.json";

const KAKAO_REQUEST_TIMEOUT_MS = 5_000;

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        message: "로그인이 필요합니다.",
      },
      {
        status: 401,
      },
    );
  }

  if (!KAKAO_REST_API_KEY) {
    return NextResponse.json(
      {
        message: "카카오 REST API 키가 설정되지 않았습니다.",
      },
      {
        status: 500,
      },
    );
  }

  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json(
      {
        message: "검색어를 입력해주세요.",
      },
      {
        status: 400,
      },
    );
  }

  const url = new URL(KAKAO_PLACE_SEARCH_URL);

  url.searchParams.set("query", query);
  url.searchParams.set("size", "15");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(KAKAO_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(
        "카카오 장소 검색 API 오류",
        response.status,
        await response.text(),
      );

      return NextResponse.json(
        {
          message: "장소 검색에 실패했습니다.",
        },
        {
          status: 502,
        },
      );
    }

    const data = (await response.json()) as KakaoPlaceSearchResponse;

    const locations: LocationSearchResult[] = [];

    for (const document of data.documents) {
      try {
        locations.push(mapKakaoPlace(document));
      } catch (error) {
        console.error("장소 검색 결과 변환 실패", error);
      }
    }

    return NextResponse.json(locations);
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          message: "장소 검색 요청 시간이 초과되었습니다.",
        },
        {
          status: 504,
        },
      );
    }

    console.error("장소 검색 중 오류가 발생했습니다.", error);

    return NextResponse.json(
      {
        message: "장소 검색 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
