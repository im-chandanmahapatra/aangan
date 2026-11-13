import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/v2/data";

type Props = {
  listings: Listing[];
  zoom?: number;
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  className?: string;
  label?: string;
};

type MapStatus = "loading" | "ready" | "error";

function osmUrl([lat, lng]: [number, number], zoom: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

/**
 * Client-only Leaflet map. Listing coordinates are intentionally locality-level
 * approximations; the exact address is shared only for a confirmed visit.
 */
export function MapView({
  listings,
  zoom = 13,
  activeSlug = null,
  onSelect,
  className = "",
  label,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [status, setStatus] = useState<MapStatus>("loading");

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || listings.length === 0) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;

    setStatus("loading");

    void import("leaflet")
      .then((L) => {
        if (disposed) return;

        const centre = listings[0].coords;
        map = L.map(container, {
          center: centre,
          zoom,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
          maxZoom: 19,
        }).addTo(map);

        tiles.once("load", () => {
          if (!disposed) setStatus("ready");
        });

        const bounds = L.latLngBounds([]);

        listings.forEach((listing, index) => {
          const pin = document.createElement("span");
          pin.className = "v2-pin";
          pin.dataset.kind = listing.kind;
          pin.dataset.active = String(activeSlug === listing.slug || listings.length === 1);
          pin.textContent = String(index + 1).padStart(2, "0");

          const marker = L.marker(listing.coords, {
            icon: L.divIcon({
              className: "v2-pin-wrap",
              html: pin,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
              popupAnchor: [0, -18],
            }),
            keyboard: true,
            title: `${listing.name}, ${listing.locality}`,
            alt: `Approximate location of ${listing.name}`,
          }).addTo(map!);

          const popup = document.createElement("div");
          popup.className = "v2-map-popup";

          const name = document.createElement("strong");
          name.textContent = listing.name;
          popup.appendChild(name);

          const place = document.createElement("span");
          place.textContent = `${listing.locality}, ${listing.city}`;
          popup.appendChild(place);

          marker.bindPopup(popup, { closeButton: false, offset: [0, -2] });
          marker.on("click", () => onSelectRef.current?.(listing.slug));
          bounds.extend(listing.coords);
        });

        if (listings.length > 1) {
          map.fitBounds(bounds.pad(0.22), { maxZoom: zoom });
        }

        // The map is mounted inside a tab panel. Invalidate after layout so
        // Leaflet measures the now-visible panel rather than its hidden state.
        requestAnimationFrame(() => map?.invalidateSize(false));

        // Keep controls usable even when a tile response is slow.
        readyTimer = setTimeout(() => {
          if (!disposed) setStatus("ready");
        }, 1800);
      })
      .catch((error) => {
        console.error("Unable to initialise the location map", error);
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      if (readyTimer) clearTimeout(readyTimer);
      map?.remove();
    };
  }, [activeSlug, listings, zoom]);

  const first = listings[0];

  return (
    <div className={`v2-map ${className}`} data-status={status}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="region"
        aria-label={label ?? "Interactive approximate location map"}
      />

      {status === "loading" && (
        <div className="v2-map-state" aria-live="polite">
          <span className="v2-map-loader" aria-hidden="true" />
          <span className="v2-label">Drawing the locality map…</span>
        </div>
      )}

      {status === "error" && first && (
        <div className="v2-map-state v2-map-state--error" role="alert">
          <p className="v2-label">The map could not be loaded</p>
          <p className="v2-caption mt-2">You can still view the approximate locality.</p>
          <a
            className="v2-btn v2-btn--line mt-5"
            href={osmUrl(first.coords, zoom)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in OpenStreetMap
          </a>
        </div>
      )}

      {status === "ready" && first && (
        <a
          className="v2-map-open v2-caption"
          href={osmUrl(first.coords, zoom)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open larger map ↗
        </a>
      )}
    </div>
  );
}
