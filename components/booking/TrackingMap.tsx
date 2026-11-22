"use client";

import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

type TrackingMapProps = {
  /** 0 = far, 1 = arrived */
  progress: number;
  etaMins: number;
  proLabel: string;
  address: string;
  className?: string;
  /** Optional destination [lng, lat] — defaults London or Lagos from market. */
  destLngLat?: [number, number];
  startLngLat?: [number, number];
};

type MapboxConfig = {
  accessToken: string | null;
  mapboxEnabled: boolean;
  mode: "live" | "mock";
};

/** London demo coords — destination near central address. */
const LONDON_DEST: [number, number] = [-0.1419, 51.5014];
const LONDON_START: [number, number] = [-0.162, 51.515];
/** Lagos Island demo. */
const LAGOS_DEST: [number, number] = [3.4219, 6.4281];
const LAGOS_START: [number, number] = [3.3792, 6.5244];

function lerpLngLat(
  t: number,
  start: [number, number],
  dest: [number, number]
): [number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  return [
    start[0] + (dest[0] - start[0]) * clamped,
    start[1] + (dest[1] - start[1]) * clamped,
  ];
}

function PlaceholderMap({
  progress,
  etaMins,
  proLabel,
  address,
  className,
}: TrackingMapProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const left = 18 + clamped * 32;
  const top = 18 + clamped * 48;

  return (
    <div
      className={cn(
        "relative h-56 w-full overflow-hidden bg-[#F3F4F6]",
        className
      )}
      role="img"
      aria-label={`Map placeholder. ${proLabel} ETA ${etaMins} minutes.`}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute left-[10%] top-0 h-full w-[2px] bg-white" />
      <div className="absolute left-[42%] top-0 h-full w-[3px] bg-white" />
      <div className="absolute left-[70%] top-0 h-full w-[2px] bg-white" />
      <div className="absolute left-0 top-[30%] h-[2px] w-full bg-white" />
      <div className="absolute left-0 top-[62%] h-[3px] w-full bg-white" />

      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <line
          x1="22%"
          y1="22%"
          x2="50%"
          y2="78%"
          stroke="#5B2C87"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.45"
        />
      </svg>

      <div className="absolute bottom-[18%] left-1/2 z-10 -translate-x-1/2 text-center">
        <span className="mx-auto flex h-3 w-3 rounded-full bg-black" />
        <span className="mt-1 block max-w-[9rem] truncate text-[10px] text-brand-muted">
          {address.split(",")[0]}
        </span>
      </div>

      <div
        className="absolute z-20 transition-all duration-1000 ease-linear"
        style={{ left: `${left}%`, top: `${top}%` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-2 animate-ping rounded-full bg-brand-purple/20" />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-white">
            {proLabel.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      <p className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
        Mapbox · mock
      </p>
    </div>
  );
}

function MapboxGlMap({
  progress,
  etaMins,
  proLabel,
  address,
  accessToken,
  className,
  destLngLat,
  startLngLat,
}: TrackingMapProps & { accessToken: string }) {
  const DEST = destLngLat ?? LONDON_DEST;
  void (startLngLat ?? LONDON_START);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const proMarkerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const destRef = useRef(DEST);
  destRef.current = DEST;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = accessToken;
        const dest = destRef.current;
        const start = startLngLat ?? LONDON_START;

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: dest,
          zoom: 13.2,
          attributionControl: false,
          interactive: false,
        });

        map.addControl(
          new mapboxgl.AttributionControl({ compact: true }),
          "bottom-right"
        );

        map.on("load", () => {
          if (cancelled) return;

          const route: GeoJSON.Feature = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [start, dest],
            },
          };

          map.addSource("route", { type: "geojson", data: route });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#5B2C87",
              "line-width": 3,
              "line-dasharray": [2, 1.5],
              "line-opacity": 0.65,
            },
          });

          const destEl = document.createElement("div");
          destEl.className = "pmb-dest-marker";
          destEl.innerHTML = `<div style="text-align:center"><span style="display:block;width:12px;height:12px;margin:0 auto;border-radius:999px;background:#111"></span><span style="display:block;margin-top:4px;max-width:7rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;color:#6B7280">${address.split(",")[0]}</span></div>`;
          new mapboxgl.Marker({ element: destEl, anchor: "bottom" })
            .setLngLat(dest)
            .addTo(map);

          const proEl = document.createElement("div");
          proEl.innerHTML = `<div style="position:relative;transform:translate(-50%,-50%)"><span style="position:absolute;inset:-8px;border-radius:999px;background:rgba(91,44,135,0.2)"></span><span style="position:relative;display:flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:999px;background:#5B2C87;color:#fff;font-size:10px;font-weight:700">${proLabel.slice(0, 2).toUpperCase()}</span></div>`;
          const proMarker = new mapboxgl.Marker({ element: proEl })
            .setLngLat(lerpLngLat(progress, start, dest))
            .addTo(map);

          mapRef.current = map;
          proMarkerRef.current = proMarker;
          setReady(true);
        });

        map.on("error", () => {
          if (!cancelled) setFailed(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      proMarkerRef.current?.remove();
      proMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // init once per token / region
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, destLngLat?.[0], destLngLat?.[1]]);

  useEffect(() => {
    if (!proMarkerRef.current || !mapRef.current || !ready) return;
    const dest = destLngLat ?? LONDON_DEST;
    const start = startLngLat ?? LONDON_START;
    const lngLat = lerpLngLat(progress, start, dest);
    proMarkerRef.current.setLngLat(lngLat);
    mapRef.current.easeTo({
      center: [(lngLat[0] + dest[0]) / 2, (lngLat[1] + dest[1]) / 2],
      duration: 900,
    });
  }, [progress, ready, destLngLat, startLngLat]);

  if (failed) {
    return (
      <PlaceholderMap
        progress={progress}
        etaMins={etaMins}
        proLabel={proLabel}
        address={address}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn("relative h-56 w-full overflow-hidden bg-[#F3F4F6]", className)}
      role="img"
      aria-label={`Live map. ${proLabel} ETA ${etaMins} minutes.`}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && <div className="skeleton absolute inset-0" />}
      <p className="pointer-events-none absolute left-3 top-3 z-10 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
        Mapbox · live
      </p>
    </div>
  );
}

export { LONDON_DEST, LONDON_START, LAGOS_DEST, LAGOS_START };

/**
 * Tracking map: Mapbox GL when MAPBOX_ACCESS_TOKEN is set (via /api/mapbox/config);
 * otherwise the CSS grid placeholder.
 */
export function TrackingMap(props: TrackingMapProps) {
  const [config, setConfig] = useState<MapboxConfig | null>(null);

  useEffect(() => {
    fetch("/api/mapbox/config")
      .then((r) => r.json())
      .then((data: MapboxConfig) => setConfig(data))
      .catch(() =>
        setConfig({ accessToken: null, mapboxEnabled: false, mode: "mock" })
      );
  }, []);

  if (!config) {
    return (
      <div
        className={cn(
          "skeleton relative h-56 w-full overflow-hidden",
          props.className
        )}
      />
    );
  }

  if (config.mapboxEnabled && config.accessToken) {
    return (
      <MapboxGlMap {...props} accessToken={config.accessToken} />
    );
  }

  return <PlaceholderMap {...props} />;
}
