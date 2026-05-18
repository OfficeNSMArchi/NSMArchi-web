"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useLanguage } from "@/lib/language-context";

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  /** 명시적 픽셀 높이. 생략하면 부모를 absolute inset-0으로 채움 (부모에 position:relative 필요) */
  height?: number;
  mapType?: "roadmap" | "satellite" | "hybrid";
  onPinDrop?: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window { google: any; }
}

const HYBRID_STYLE = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ lightness: -20 }] },
  { elementType: "labels.text.stroke", stylers: [{ lightness: -20 }] },
  { elementType: "labels.icon", stylers: [{ lightness: -20 }] },
];

const GRAYSCALE_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4d4d4" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c8c8c8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

function PinIcon() {
  return (
    <svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="#f5761a"/>
      <circle cx="14" cy="14" r="6" fill="#c45510"/>
    </svg>
  );
}

export default function GoogleMap({ lat, lng, zoom = 15, height, mapType = "roadmap", onPinDrop }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [pinPixel, setPinPixel] = useState<{ x: number; y: number } | null>(null);
  const [scaleBar, setScaleBar] = useState<{ width: number; label: string } | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (window.google?.maps) setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom,
      mapTypeId: mapType,
      styles: mapType === "roadmap" ? GRAYSCALE_STYLE : mapType === "hybrid" ? HYBRID_STYLE : [],
      disableDefaultUI: true,
      zoomControl: false,
      scaleControl: false,
      gestureHandling: "none",
      keyboardShortcuts: false,
    });
    mapInstanceRef.current = map;

    // map bounds + 컨테이너 크기로 픽셀 좌표 계산 (Mercator 보정 포함)
    function mercY(lat: number) {
      return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    }
    function latLngToPixel(targetLat: number, targetLng: number) {
      const bounds = map.getBounds();
      const el = mapRef.current;
      if (!bounds || !el) return null;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const x = ((targetLng - sw.lng()) / (ne.lng() - sw.lng())) * el.offsetWidth;
      const y = ((mercY(ne.lat()) - mercY(targetLat)) / (mercY(ne.lat()) - mercY(sw.lat()))) * el.offsetHeight;
      return { x, y };
    }

    function updateScale() {
      const el = mapRef.current;
      if (!el) return;
      const zoom = map.getZoom();
      const center = map.getCenter();
      if (zoom == null || !center) return;
      // 구글 Web Mercator 공식 — 내장 스케일 바와 동일한 계산
      const metersPerPx = (2 * Math.PI * 6378137 * Math.cos(center.lat() * Math.PI / 180)) / (256 * Math.pow(2, zoom));
      const targetPx = 80;
      const meters = metersPerPx * targetPx;
      const nice = [1,2,5,10,20,50,100,200,500,1000,2000,5000,10000].reduce((a, b) =>
        Math.abs(b - meters) < Math.abs(a - meters) ? b : a);
      const barWidth = nice / metersPerPx;
      const label = nice >= 1000 ? `${nice / 1000} km` : `${nice} m`;
      setScaleBar({ width: barWidth, label });
    }

    const updatePin = () => {
      const p = latLngToPixel(lat, lng);
      if (p) setPinPixel(p);
    };
    window.google.maps.event.addListener(map, "bounds_changed", () => { updatePin(); updateScale(); });
    window.google.maps.event.addListenerOnce(map, "idle", () => {
      updatePin();
      updateScale();
    });

    const resizeObserver = new ResizeObserver(() => {
      window.google.maps.event.trigger(map, "resize");
      map.setCenter({ lat, lng });
    });
    if (mapRef.current) resizeObserver.observe(mapRef.current);

    if (onPinDrop) {
      const geocoder = new window.google.maps.Geocoder();
      map.addListener("click", (e: any) => {
        const clickedLat: number = e.latLng.lat();
        const clickedLng: number = e.latLng.lng();
        const p = latLngToPixel(clickedLat, clickedLng);
        if (p) setPinPixel(p);
        geocoder.geocode({ location: { lat: clickedLat, lng: clickedLng } }, (results: any, status: string) => {
          const address = status === "OK" && results?.[0] ? results[0].formatted_address : "";
          onPinDrop(clickedLat, clickedLng, address);
        });
      });
    }

    return () => {
      window.google.maps.event.clearListeners(map, "bounds_changed");
      resizeObserver.disconnect();
    };
  }, [ready, lat, lng, zoom, mapType]); // eslint-disable-line react-hooks/exhaustive-deps

  const outerRef = useRef<HTMLDivElement>(null);

  // native wheel listener (passive:false) — React onWheel은 passive라 preventDefault 불가
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!mapInstanceRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const currentZoom = mapInstanceRef.current.getZoom() ?? 15;
      mapInstanceRef.current.setZoom(currentZoom + (e.deltaY < 0 ? 1 : -1));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // height 숫자 → 명시적 높이 박스 / 생략 → 부모를 inset-0으로 채움
  const outerStyle: React.CSSProperties = height != null
    ? { position: "relative", width: "100%", height, overflow: "hidden" }
    : { position: "absolute", inset: 0, overflow: "hidden" };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&language=${language}`}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div
        ref={outerRef}
        style={outerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={mapRef} style={{ position: "absolute", inset: 0, filter: mapType === "roadmap" ? "grayscale(1)" : "grayscale(1) brightness(1.1)" }} />
        {scaleBar && (
          <div style={{ position: "absolute", right: 55, bottom: 50, zIndex: 10, pointerEvents: "none" }}>
            {(() => {
              const c = mapType === "roadmap" ? "#333" : "#fff";
              const shadow = mapType === "roadmap" ? "0 1px 2px rgba(255,255,255,0.6)" : "0 1px 2px rgba(0,0,0,0.5)";
              return <>
                <div style={{ fontSize: 11, color: c, marginBottom: 3, textAlign: "right", textShadow: shadow }}>{scaleBar.label}</div>
                <div style={{ width: scaleBar.width, height: 4, background: c, borderLeft: `3px solid ${c}`, borderRight: `3px solid ${c}` }} />
              </>;
            })()}
          </div>
        )}
        {pinPixel && (
          <div
            style={{
              position: "absolute",
              left: pinPixel.x,
              top: pinPixel.y,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <PinIcon />
          </div>
        )}
      </div>
    </>
  );
}
