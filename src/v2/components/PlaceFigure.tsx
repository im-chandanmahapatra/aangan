import { Picture } from "./Picture";

type Place = {
  image: { sm: string; lg: string; w: number; h: number; alt: string };
  caption?: string;
  credit?: string;
  url?: string;
};

type Props = {
  place: Place;
  sizes?: string;
  aspect?: string;
};

export function PlaceFigure({ place, sizes, aspect = "aspect-[4/3]" }: Props) {
  return (
    <figure>
      <div className={`${aspect} overflow-hidden`} style={{ border: "1px solid var(--line)" }}>
        <Picture image={place.image} sizes={sizes ?? "100vw"} className="w-full h-full object-cover" />
      </div>
      {(place.caption || place.credit) && (
        <figcaption className="mt-2 v2-caption">
          {place.caption}
          {place.credit && (
            <>
              {" · Photo "}
              {place.url ? (
                <a href={place.url} target="_blank" rel="noopener noreferrer" className="v2-link">
                  {place.credit}
                </a>
              ) : (
                place.credit
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/** Small inline credit line for a place photograph. */
export function PlaceCredit({ place, className }: { place: Place; className?: string }) {
  return (
    <span className={`v2-caption ${className ?? ""}`}>
      {place.caption && <>{place.caption} · </>}
      {place.credit && (
        <>
          Photo{" "}
          {place.url ? (
            <a href={place.url} target="_blank" rel="noopener noreferrer" className="v2-link">
              {place.credit}
            </a>
          ) : (
            place.credit
          )}{" "}
          / Unsplash
        </>
      )}
    </span>
  );
}
