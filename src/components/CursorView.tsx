import { useEffect, useRef, useState } from "react";

/**
 * A small circular "view" chip that follows the cursor only while it
 * hovers an element carrying `data-cursor="view"`. Desktop hover+fine
 * pointers only; hidden entirely under prefers-reduced-motion.
 */
export function CursorView() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("view");
  const active = useRef(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return;
    setEnabled(true);

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = 0, y = 0, tx = 0, ty = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(
        "[data-cursor='view']",
      );
      if (target) {
        active.current = true;
        setLabel(target.dataset.cursorLabel || "view");
        el.setAttribute("data-active", "true");
      }
    };
    const onOut = (e: MouseEvent) => {
      const from = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(
        "[data-cursor='view']",
      );
      const to = (e.relatedTarget as HTMLElement | null)?.closest?.<HTMLElement>(
        "[data-cursor='view']",
      );
      if (from && !to) {
        active.current = false;
        el.removeAttribute("data-active");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={ref} className="cursor-view" aria-hidden="true">
      {label}
    </div>
  );
}
