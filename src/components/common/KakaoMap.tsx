"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

type KakaoLatLng = {
  readonly __type: "KakaoLatLng";
};

interface KakaoMapInstance {
  relayout: () => void;
  setCenter: (position: KakaoLatLng) => void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;

  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;

  Map: new (
    container: HTMLElement,
    options: {
      center: KakaoLatLng;
      level: number;
    },
  ) => KakaoMapInstance;

  Marker: new (options: {
    map: KakaoMapInstance;
    position: KakaoLatLng;
  }) => unknown;
}

interface Props {
  latitude: number;
  longitude: number;
}

export default function KakaoMap({ latitude, longitude }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const initializeMap = useCallback(() => {
    const kakaoMaps = window.kakao?.maps;

    if (!kakaoMaps || !mapRef.current) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.error("잘못된 지도 좌표입니다.", {
        latitude,
        longitude,
      });
      return;
    }

    kakaoMaps.load(() => {
      if (!mapRef.current) return;

      const position = new kakaoMaps.LatLng(lat, lng);

      const map = new kakaoMaps.Map(mapRef.current, {
        center: position,
        level: 3,
      });

      new kakaoMaps.Marker({
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
