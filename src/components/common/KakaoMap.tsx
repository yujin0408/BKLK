"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

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
  const [isMapError, setIsMapError] = useState(false);
  const [scriptKey, setScriptKey] = useState(0);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  const initializeMap = useCallback(() => {
    const kakaoMaps = window.kakao?.maps;

    if (!kakaoMaps) {
      setIsMapError(true);
      return;
    }

    if (!mapRef.current) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setIsMapError(true);
      return;
    }

    kakaoMaps.load(() => {
      if (!mapRef.current) {
        setIsMapError(true);
        return;
      }

      try {
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

        setIsMapError(false);
      } catch (error) {
        console.error("카카오 지도 초기화 실패", error);
        setIsMapError(true);
      }
    });
  }, [latitude, longitude]);

  const handleRetry = () => {
    setIsMapError(false);

    if (window.kakao?.maps) {
      initializeMap();
      return;
    }

    setScriptKey((prev) => prev + 1);
  };

  if (!appKey) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-gray-100">
        지도 API 키가 설정되지 않았습니다.
      </div>
    );
  }

  if (isMapError) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3 rounded-xl bg-gray-100">
        <p>지도를 불러오지 못했습니다.</p>

        <button
          type="button"
          onClick={handleRetry}
          className="rounded-md border px-4 py-2"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        key={scriptKey}
        id={`kakao-map-sdk-${scriptKey}`}
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&retry=${scriptKey}`}
        strategy="afterInteractive"
        onReady={initializeMap}
        onError={(error) => {
          console.error("카카오 지도 SDK 로딩 실패", error);
          setIsMapError(true);
        }}
      />

      <div ref={mapRef} className="h-[400px] w-full rounded-xl" />
    </>
  );
}
