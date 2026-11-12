import { createFileRoute, Link } from "@tanstack/react-router";
import { fmt, getListing, plotArea, type Listing } from "@/v2/data";
import { useShortlist } from "@/v2/shortlist";
import { Picture } from "@/v2/components/Picture";
import { SitePlan } from "@/v2/components/Drawings";
import { StatusTag } from "@/v2/components/ListingCard";
import { Arrow } from "@/v2/components/Logo";

export const Route = createFileRoute("/v2/shortlist")({
  head: () => ({
    meta: [{ title: "Your shortlist · Aangan" }, { name: "robots", content: "noindex" }],
  }),
  component: Shortlist,
});

const rows: [string, (l: Listing) => string][] = [
  ["Type", (l) => (l.kind === "plot" ? "Land" : "Residence")],
  ["Location", (l) => `${l.locality}, ${l.city}`],
  ["Status", (l) => l.status],
  ["Rooms", (l) => (l.bhk ? `${l.bhk} BHK` : "—")],
  ["Built area", (l) => (l.builtSqft ? `${fmt(l.builtSqft)} sq ft` : "—")],
  ["Land area", (l) => (l.plot ? `${fmt(plotArea(l))} sq ft` : "—")],
  ["Facing", (l) => l.plot?.facing ?? "—"],
  ["Price", () => "On enquiry"],
];

function Shortlist() {
  const { items, toggle, clear } = useShortlist();
  const list = items.map(getListing).filter((l): l is Listing => !!l);

  return (
    <section
      className="v2-wrap pb-24 v2-paper"
      style={{ paddingTop: "calc(var(--nav-h) + clamp(2.5rem, 6vw, 5rem))" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="v2-label">Your shortlist</p>
          <h1 className="v2-d1 mt-5" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}>
            {list.length
              ? `${list.length} saved ${list.length === 1 ? "listing" : "listings"}`
              : "Nothing saved yet"}
          </h1>
          <p className="v2-lead mt-4">
            Saved on this device only. Compare side by side, then ask about them together.
          </p>
        </div>
        {list.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button type="button" className="v2-btn v2-btn--line" onClick={clear}>
              Clear all
            </button>
            <Link
              to="/v2/enquire"
              search={{ shortlist: list.map((l) => l.slug).join(","), visit: true }}
              className="v2-btn v2-btn--primary"
            >
              Arrange visits for these <Arrow />
            </Link>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div
          className="mt-12 py-20 grid place-items-center gap-5 text-center"
          style={{ border: "1px dashed var(--line-strong)" }}
        >
          <p className="v2-body max-w-md">
            Use the bookmark on any residence or plot to save it here. Your shortlist stays on this
            device.
          </p>
          <Link to="/v2/collection" className="v2-btn v2-btn--ink">
            Browse the collection <Arrow />
          </Link>
        </div>
      ) : (
        <div className="mt-12 overflow-x-auto -mx-[var(--gutter)] px-[var(--gutter)]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">Comparison of saved listings</caption>
            <thead>
              <tr>
                <th scope="col" className="w-36" />
                {list.map((l) => (
                  <th
                    key={l.slug}
                    scope="col"
                    className="align-top pb-6 pr-6 font-normal min-w-[220px]"
                  >
                    <Link
                      to="/v2/collection/$slug"
                      params={{ slug: l.slug }}
                      className="block no-underline text-inherit"
                    >
                      <div
                        className="relative v2-media aspect-[4/3]"
                        style={{ background: "var(--plaster)" }}
                      >
                        {l.image ? (
                          <Picture image={l.image} sizes="300px" />
                        ) : (
                          <SitePlan listing={l} className="w-full h-full p-3" />
                        )}
                      </div>
                      <span
                        className="block mt-3"
                        style={{
                          fontFamily: "var(--f-display)",
                          fontSize: "1.5rem",
                          lineHeight: 1.05,
                        }}
                      >
                        {l.name}
                      </span>
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                      <StatusTag status={l.status} />
                      <button
                        type="button"
                        className="v2-link text-[0.8rem]"
                        onClick={() => toggle(l.slug)}
                        aria-label={`Remove ${l.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label} style={{ borderTop: "1px solid var(--line)" }}>
                  <th scope="row" className="py-3 pr-6 v2-label font-normal">
                    {label}
                  </th>
                  {list.map((l) => (
                    <td key={l.slug} className="py-3 pr-6 text-[0.95rem] v2-num">
                      {get(l)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
