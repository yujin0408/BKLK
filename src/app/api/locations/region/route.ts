import { NextRequest, NextResponse } from "next/server";
import { KakaoCoordinateAddressResponse } from "@/features/locations/types";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(request: NextRequest) {
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

  const url = new URL("https://dapi.kakao.com/v2/local/geo/coord2address.json");

  url.searchParams.set("x", longitude);
  url.searchParams.set("y", latitude);
  url.searchParams.set("input_coord", "WGS84");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
      cache: "no-store",
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
