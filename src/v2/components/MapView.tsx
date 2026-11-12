import { useEffect, useRef, useState } from "react";
import type { Listing } from "../data";

type Props = {
  listings: Listing[];
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  zoom?: number;
  className?: string;
  label: string;
};

/**
 * Leaflet + OpenStreetMap tiles, loaded only in the browser and only when the
 * map is rendered (keeps Leaflet out of SSR and the initial bundle).
 * Pins are locality-level approximations, never addresses.
 */
export function MapView({ listings, activeSlug, onSelect, zoom, className = "", label }: Props) {
  const el = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markers = useRef(new Map<string, import("leaflet").Marker>());
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  const key = listings.map((l) => l.slug).join("|");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ default: L }] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);
        if (cancelled || !el.current) return;
        if (!mapRef.current) {
          mapRef.current = L.map(el.current, {
            scrollWheelZoom: false,
            zoomControl: true,
            attributionControl: true,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapRef.current);
        }
        const map = mapRef.current;
        markers.current.forEach((m) => m.remove());
        markers.current.clear();
        listings.forEach((l, i) => {
          const icon = L.divIcon({
            className: "",
            html: `<span class="v2-pin" data-kind="${l.kind}">${i + 1}</span>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          const m = L.marker(l.coords, {
            icon,
            title: `${l.name}, ${l.locality}`,
            keyboard: true,
            riseOnHover: true,
          })
            .addTo(map)
            .bindTooltip(`${l.name} · ${l.city}`, { direction: "top", offset: [0, -14] });
          m.on("click", () => selectRef.current?.(l.slug));
          markers.current.set(l.slug, m);
        });
        if (listings.length === 1) {
          map.setView(listings[0].coords, zoom ?? 13);
        } else if (listings.length > 1) {
          map.fitBounds(L.latLngBounds(listings.map((l) => l.coords)), {
            padding: [48, 48],
            maxZoom: 9,
          });
        } else {
          map.setView([20.5, 77.5], 4);
        }
        setState("ready");
      } catch (e) {
        console.error("[v2 map]", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, zoom]);

  useEffect(() => {
    markers.current.forEach((m, slug) => {
      const node = m.getElement()?.querySelector(".v2-pin");
      if (node) node.setAttribute("data-active", slug === activeSlug ? "true" : "false");
      if (slug === activeSlug) m.setZIndexOffset(1000);
      else m.setZIndexOffset(0);
    });
  }, [activeSlug, state]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  return (
    <div className={`relative ${className}`} style={{ background: "var(--plaster)" }}>
      <div ref={el} className="absolute inset-0" role="region" aria-label={label} />
      {state === "loading" && (
        <div className="absolute inset-0 grid place-items-center v2-label" aria-live="polite">
          Loading map…
        </div>
      )}
      {state === "error" && (
        <div
          className="absolute inset-0 grid place-items-center p-6 text-center v2-body"
          role="status"
        >
          The map couldn’t load. Localities:{" "}
          {listings.map((l) => `${l.locality}, ${l.city}`).join(" · ")}
        </div>
      )}
    </div>
  );
}
