"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface KakaoMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
  label?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({ lat, lng, zoom = 3, height = 300, label }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  function initMap() {
    if (!mapRef.current || !window.kakao?.maps) return;
    window.kakao.maps.load(() => {
      const center = new window.kakao.maps.LatLng(lat, lng);
      const map = new window.kakao.maps.Map(mapRef.current, { center, level: zoom });
      new window.kakao.maps.Marker({ position: center, map });
      mapInstanceRef.current = map;
    });
  }

  useEffect(() => {
    // 스크립트가 이미 로드된 경우 (페이지 내 두 번째 KakaoMap 등)
    if (window.kakao?.maps) {
      initMap();
    }
  }, [scriptLoaded, lat, lng, zoom]);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  return (
    <div className="w-full overflow-hidden rounded" style={{ height }}>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {label && (
        <p className="text-xs text-zinc-400 mt-2 text-center tracking-wide">{label}</p>
      )}
    </div>
  );
}
