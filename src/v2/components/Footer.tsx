import { Link } from "@tanstack/react-router";
import { studio } from "../data";
import { Logo, Mark } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="v2-forest">
      <div className="v2-wrap pt-20 md:pt-24 pb-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4" style={{ color: "var(--on-dark)" }}>
              <Mark size={44} />
            </div>
            <p
              className="mt-8 max-w-[14ch]"
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                lineHeight: 0.98,
              }}
            >
              Houses held around a courtyard, built slowly.
            </p>
            <p className="v2-body mt-6 max-w-md">
              An architecture, interior and residential studio working across{" "}
              {studio.cities.join(", ").replace(/, ([^,]*)$/, " and $1")}.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
            <p className="v2-label">Explore</p>
            <ul className="mt-5 grid gap-1 text-[0.95rem]">
              <li>
                <Link
                  to="/v2/collection"
                  search={{ kind: "residence" }}
                  className="v2-link inline-block py-1.5"
                >
                  Residences
                </Link>
              </li>
              <li>
                <Link
                  to="/v2/collection"
                  search={{ kind: "plot" }}
                  className="v2-link inline-block py-1.5"
                >
                  Land to build on
                </Link>
              </li>
              <li>
                <Link to="/v2/interiors" className="v2-link inline-block py-1.5">
                  Interiors
                </Link>
              </li>
              <li>
                <Link to="/v2/studio" className="v2-link inline-block py-1.5">
                  Studio &amp; process
                </Link>
              </li>
              <li>
                <Link to="/v2/shortlist" className="v2-link inline-block py-1.5">
                  Your shortlist
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="v2-label">Visit &amp; write</p>
            <ul className="mt-5 grid gap-1 text-[0.95rem]">
              <li>
                <Link
                  to="/v2/enquire"
                  search={{ visit: true }}
                  className="v2-link inline-block py-1.5"
                >
                  Arrange a private visit
                </Link>
              </li>
              <li>
                <a href={`mailto:${studio.email}`} className="v2-link inline-block py-1.5">
                  {studio.email}
                </a>
              </li>
              <li className="pt-1.5" style={{ color: "var(--on-dark-2)" }}>
                {studio.address}
              </li>
            </ul>
          </div>
        </div>

        <p
          className="mt-16 text-[0.78rem] leading-relaxed max-w-3xl"
          style={{ color: "var(--on-dark-3)" }}
        >
          House and interior imagery is representational. Area photographs are real and credited
          (Unsplash). Land marked “Demonstration” is a sample, not inventory. Prices, plans and
          documents are shared on enquiry and should be verified independently.
        </p>
      </div>
      <div style={{ borderTop: "1px solid var(--line)" }}>
        <div className="v2-wrap py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link to="/v2" className="text-inherit no-underline" aria-label="Aangan — home">
            <Logo compact devanagari={false} />
          </Link>
          <div
            className="flex flex-wrap gap-x-7 gap-y-2 v2-figcap"
            style={{ color: "var(--on-dark-2)" }}
          >
            <Link to="/v2/collection" className="no-underline text-inherit hover:underline">
              Collection
            </Link>
            <Link to="/v2/interiors" className="no-underline text-inherit hover:underline">
              Interiors
            </Link>
            <Link to="/v2/studio" className="no-underline text-inherit hover:underline">
              Studio
            </Link>
            <Link to="/v2/enquire" className="no-underline text-inherit hover:underline">
              Contact
            </Link>
          </div>
          <p className="v2-caption flex gap-5" style={{ color: "var(--on-dark-3)" }}>
            <span>© {year} Aangan Design Studio</span>
            <a href="/" className="v2-link">
              V1 site
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
