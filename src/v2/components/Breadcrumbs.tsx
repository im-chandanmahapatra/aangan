import { Link } from "@tanstack/react-router";

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({
  crumbs,
  dark,
}: {
  crumbs: Crumb[];
  dark?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="v2-label flex flex-wrap gap-2"
      style={dark ? { color: "var(--on-dark-2)" } : undefined}
    >
      <Link to="/v2" className="v2-link">
        Aangan
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.label} className="contents">
            <span aria-hidden="true">/</span>
            {isLast || !c.to ? (
              <span
                aria-current={isLast ? "page" : undefined}
                style={{
                  color: dark ? "var(--on-dark)" : "var(--ink)",
                }}
              >
                {c.label}
              </span>
            ) : (
              <Link to={c.to} className="v2-link">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
