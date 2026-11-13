import { useEffect } from "react";
import { Picture } from "./Picture";

type Slide = {
  image: { sm: string; lg: string; w: number; h: number; alt: string };
  title?: string;
  meta?: string;
};

type Props = {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
};

export function Lightbox({ slides, index, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center"
      style={{ background: "rgb(12 18 14 / 0.95)" }}
      onClick={onClose}
      role="dialog"
      aria-label={slide.title ?? "Image viewer"}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 v2-label p-2"
        style={{ color: "var(--on-dark)" }}
        aria-label="Close"
      >
        ✕
      </button>
      <figure className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <Picture image={slide.image} sizes="90vw" className="max-h-[80vh] w-auto object-contain" />
        {(slide.title || slide.meta) && (
          <figcaption className="mt-3 text-center" style={{ color: "var(--on-dark-2)" }}>
            {slide.title && <span className="v2-label">{slide.title}</span>}
            {slide.meta && <span className="v2-caption ml-3">{slide.meta}</span>}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
