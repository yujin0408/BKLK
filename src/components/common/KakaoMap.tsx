"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface Props {
  latitude: number;
  longitude: number;
}

export default function KakaoMap({ latitude, longitude }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const initializeMap = useCallback(() => {
    if (!window.kakao?.maps || !mapRef.current) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.error("잘못된 지도 좌표입니다.", {
        latitude,
        longitude,
      });
      return;
    }

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      const position = new window.kakao.maps.LatLng(lat, lng);

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: position,
        level: 3,
      });

      new window.kakao.maps.Marker({
        map,
        position,
      });

      requestAnimationFrame(() => {
        map.relayout();
        map.setCenter(position);
      });
    });
  }, [latitude, longitude]);

  if (!appKey) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        지도 API 키가 설정되지 않았습니다.
      </div>
    );
  }

  return (
    <>
      <Script
        id="kakao-map-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`}
        strategy="afterInteractive"
        onReady={initializeMap}
        onError={(error) => {
          console.error("카카오 지도 SDK 로딩 실패", error);
        }}
      />

      <div ref={mapRef} className="h-[400px] w-full rounded-xl" />
    </>
  );
}
