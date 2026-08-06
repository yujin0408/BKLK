export interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
}

export interface KakaoPlaceSearchResponse {
  documents: KakaoPlaceDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface LocationSearchResult {
  id: string;
  placeName: string;
  address: string;
  roadAddress: string;
  displayAddress: string;
  categoryName: string;
  phone: string;
  longitude: number;
  latitude: number;
  placeUrl: string;
}

export interface KakaoRegionAddress {
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  mountain_yn: "Y" | "N";
  main_address_no: string;
  sub_address_no: string;
}

export interface KakaoRoadAddress {
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  road_name: string;
  underground_yn: "Y" | "N";
  main_building_no: string;
  sub_building_no: string;
  building_name: string;
  zone_no: string;
}

export interface KakaoCoordinateAddressDocument {
  address: KakaoRegionAddress | null;
  road_address: KakaoRoadAddress | null;
}

export interface KakaoCoordinateAddressResponse {
  documents: KakaoCoordinateAddressDocument[];
  meta: {
    total_count: number;
  };
}

export interface SelectedLocation {
  placeName: string;
  address: string;
  region1DepthName: string;
  region2DepthName: string;
  longitude: number;
  latitude: number;
}

export interface LocationRegion {
  region1DepthName: string;
  region2DepthName: string;
}
