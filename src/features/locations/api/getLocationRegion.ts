import { LocationRegion } from "@/features/locations/types";

interface GetLocationRegionParams {
  longitude: number;
  latitude: number;
}

interface ErrorResponse {
  message?: string;
}

export default async function getLocationRegion({
  longitude,
  latitude,
}: GetLocationRegionParams): Promise<LocationRegion> {
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
  });

  const response = await fetch(`/api/locations/region?${params.toString()}`);

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;

    throw new Error(errorData?.message ?? "지역 정보를 불러오지 못했습니다.");
  }

  return (await response.json()) as LocationRegion;
}
