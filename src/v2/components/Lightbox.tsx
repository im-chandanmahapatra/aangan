import { useEffect, useRef } from "react";
import type { Img } from "../data";

export type Slide = { image: Img; title: string; meta?: string };

/** Accessible image viewer: focus moves in, Esc closes, ← → navigate, focus returns on close. */
export function Lightbox({
  slides,
  index,
  onIndex,
  onClose,
}: {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const returnTo = useRef<Element | null>(null);
  const n = slides.length;

  useEffect(() => {
    returnTo.current = document.activeElement;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      (returnTo.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % n);
      if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
      if (e.key === "Tab") {
        // Keep focus inside the dialog.
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("#v2-lightbox button"));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, n, onClose, onIndex]);

  const s = slides[index];
  return (
    <div
      id="v2-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${s.title} — image ${index + 1} of ${n}`}
      className="fixed inset-0 z-[120] flex flex-col"
      style={{
        background: "rgb(20 20 18 / 0.96)",
        color: "var(--on-dark)",
        animation: "v2-fade 250ms var(--ease)",
      }}
      onClick={onClose}
    >
      <div
        className="v2-wrap flex items-center justify-between h-16"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="v2-label" style={{ color: "var(--on-dark-2)" }}>
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </p>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="v2-btn v2-btn--line"
          style={{ minHeight: "2.5rem" }}
        >
          Close
        </button>
      </div>
      <figure
        className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 md:px-20 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={s.image.lg}
          alt={s.image.alt}
          className="max-h-[72vh] w-auto max-w-full object-contain"
          width={s.image.w}
          height={s.image.h}
        />
        <figcaption className="mt-5 w-full max-w-3xl flex items-baseline justify-between gap-4">
          <span style={{ fontFamily: "var(--f-display)", fontSize: "1.6rem" }}>{s.title}</span>
          <span className="v2-label" style={{ color: "var(--on-dark-2)" }}>
            {s.meta ?? "Representational image"}
          </span>
        </figcaption>
      </figure>
      {n > 1 && (
        <div
          className="v2-wrap flex justify-center gap-3 pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="v2-btn v2-btn--line"
            onClick={() => onIndex((index - 1 + n) % n)}
            aria-label="Previous image"
          >
            ← Prev
          </button>
          <button
            type="button"
            className="v2-btn v2-btn--line"
            onClick={() => onIndex((index + 1) % n)}
            aria-label="Next image"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
