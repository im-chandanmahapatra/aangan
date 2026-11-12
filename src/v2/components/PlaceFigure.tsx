import type { Place } from "../data";
import { Picture } from "./Picture";

/** Credit line for Unsplash photography (attribution is courtesy, not required). */
export function PlaceCredit({ place, className = "" }: { place: Place; className?: string }) {
  return (
    <a
      href={place.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`v2-caption v2-link ${className}`}
    >
      Photo · {place.credit} / Unsplash
    </a>
  );
}

/**
 * A real photograph of a listing's surroundings. Always captioned as the
 * area — never presented as the listing itself.
 */
export function PlaceFigure({
  place,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  aspect = "aspect-[4/5]",
}: {
  place: Place;
  sizes?: string;
  aspect?: string;
}) {
  return (
    <figure>
      <div className={`relative v2-media ${aspect}`}>
        <Picture image={place.image} sizes={sizes} />
        <span className="absolute left-3 top-3 v2-tag">Area photograph</span>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[0.9rem]" style={{ color: "var(--ink-2)" }}>
          {place.caption}
        </span>
        <PlaceCredit place={place} />
      </figcaption>
    </figure>
  );
}
