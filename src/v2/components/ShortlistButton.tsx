import { useShortlist } from "../shortlist";

export function ShortlistButton({
  slug,
  name,
  variant = "chip",
}: {
  slug: string;
  name: string;
  variant?: "chip" | "button" | "icon";
}) {
  const { has, toggle } = useShortlist();
  const on = has(slug);
  const icon = (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 1.75h9v12.5L8 11.2l-4.5 3.05z"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(slug);
        }}
        aria-pressed={on}
        aria-label={on ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
        title={on ? "Saved to shortlist" : "Save to shortlist"}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300"
        style={{
          background: on ? "var(--ink)" : "rgb(243 239 231 / 0.92)",
          color: on ? "var(--lime)" : "var(--ink)",
          border: "1px solid var(--line)",
        }}
      >
        {icon}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={on}
      className={variant === "chip" ? "v2-chip" : `v2-btn ${on ? "v2-btn--ink" : "v2-btn--line"}`}
    >
      {icon}
      {on ? "Saved to shortlist" : "Save to shortlist"}
    </button>
  );
}
