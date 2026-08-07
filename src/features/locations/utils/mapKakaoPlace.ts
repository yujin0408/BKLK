import {
  KakaoPlaceDocument,
  LocationSearchResult,
} from "@/features/locations/types";

export default function mapKakaoPlace(
  place: KakaoPlaceDocument,
): LocationSearchResult {
  const longitudeValue = typeof place.x === "string" ? place.x.trim() : "";

  const latitudeValue = typeof place.y === "string" ? place.y.trim() : "";

  if (!longitudeValue || !latitudeValue) {
    throw new Error("장소 좌표가 없습니다.");
  }

  const longitude = Number(longitudeValue);
  const latitude = Number(latitudeValue);

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    throw new Error("장소 좌표 형식이 올바르지 않습니다.");
  }

  return {
    id: place.id,
    placeName: place.place_name,
    address: place.address_name,
    roadAddress: place.road_address_name,
    displayAddress: place.road_address_name || place.address_name,
    categoryName: place.category_name,
    phone: place.phone,
    longitude,
    latitude,
    placeUrl: place.place_url,
  };
}
