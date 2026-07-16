"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!isScriptLoaded || !window.kakao?.maps || !mapRef.current) {
      return;
    }

    window.kakao.maps.load(() => {
      if (!mapRef.current) return;

      const position = new window.kakao.maps.LatLng(
        Number(latitude),
        Number(longitude),
      );

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: position,
        level: 3,
      });

      new window.kakao.maps.Marker({
        map,
        position,
      });
    });
  }, [isScriptLoaded, latitude, longitude]);

  if (!appKey) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        카카오 지도 API 키가 설정되지 않았습니다.
      </div>
    );
  }

  return (
    <>
      <Script
        id="kakao-map-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsScriptLoaded(true);
        }}
        onError={(event) => {
          console.error("카카오 지도 SDK 로딩 실패", event);
        }}
      />

      <div ref={mapRef} className="h-[400px] w-full rounded-xl" />
    </>
  );
}
