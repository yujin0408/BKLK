import { NextRequest, NextResponse } from "next/server";
import { KakaoCoordinateAddressResponse } from "@/features/locations/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

const KAKAO_COORDINATE_ADDRESS_URL =
  "https://dapi.kakao.com/v2/local/geo/coord2address.json";

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

  const longitude = request.nextUrl.searchParams.get("longitude");
  const latitude = request.nextUrl.searchParams.get("latitude");

  if (!longitude || !latitude) {
    return NextResponse.json(
      {
        message: "경도와 위도가 필요합니다.",
      },
      {
        status: 400,
      },
    );
  }

  const longitudeNumber = Number(longitude);
  const latitudeNumber = Number(latitude);

  if (!Number.isFinite(longitudeNumber) || !Number.isFinite(latitudeNumber)) {
    return NextResponse.json(
      {
        message: "좌표 형식이 올바르지 않습니다.",
      },
      {
        status: 400,
      },
    );
  }

  const url = new URL(KAKAO_COORDINATE_ADDRESS_URL);

  url.searchParams.set("x", String(longitudeNumber));
  url.searchParams.set("y", String(latitudeNumber));
  url.searchParams.set("input_coord", "WGS84");

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
        "카카오 좌표 변환 API 오류",
        response.status,
        await response.text(),
      );

      return NextResponse.json(
        {
          message: "지역 정보를 불러오지 못했습니다.",
        },
        {
          status: 502,
        },
      );
    }

    const data = (await response.json()) as KakaoCoordinateAddressResponse;

    const document = data.documents[0];

    if (!document?.address) {
      return NextResponse.json(
        {
          message: "해당 좌표의 지역 정보를 찾지 못했습니다.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      region1DepthName: document.address.region_1depth_name,
      region2DepthName: document.address.region_2depth_name,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          message: "지역 정보 조회 요청 시간이 초과되었습니다.",
        },
        {
          status: 504,
        },
      );
    }

    console.error("지역 정보 조회 중 오류가 발생했습니다.", error);

    return NextResponse.json(
      {
        message: "지역 정보 조회 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
