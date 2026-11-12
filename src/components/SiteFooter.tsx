import { Link } from "@tanstack/react-router";
import { studio } from "@/data/site";
import { SiteSeal } from "./SiteSeal";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-foreground/10">
      <div className="mx-auto max-w-[1720px] px-6 md:px-12 pt-28 md:pt-40 pb-12">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-7">
            <div className="flex items-baseline gap-4">
              <span className="folio">Folio · Colophon</span>
              <span className="rule flex-1 max-w-[220px]" aria-hidden="true" />
            </div>
            <h2
              className="mt-10 display text-foreground leading-[0.9] flex items-baseline gap-6 flex-wrap"
              style={{ fontSize: "clamp(4rem, 12vw, 11rem)", letterSpacing: "-0.03em" }}
            >
              <span className="devanagari opacity-60" aria-hidden="true">आँगन</span>
              <span>Aangan.</span>
            </h2>
            <p className="mt-10 max-w-md text-[15px] leading-[1.8] text-muted-foreground">
              An architecture, interior, and residential development studio.
              Working quietly across India on private houses we would want to
              live in ourselves.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-9">
            <p className="folio mb-6">Studio</p>
            <ul className="space-y-3 text-sm text-foreground">
              <li>
                <a href={`mailto:${studio.email}`} className="nav-underline">{studio.email}</a>
              </li>
              <li className="text-muted-foreground tnum">{studio.phone}</li>
              <li className="text-muted-foreground pt-2">{studio.address}</li>
            </ul>
            <p className="folio mt-10 mb-4">Elsewhere</p>
            <ul className="grid grid-cols-2 gap-y-2 text-sm">
              <li><Link to="/residences" className="nav-underline">Residences</Link></li>
              <li><Link to="/interiors" className="nav-underline">Interiors</Link></li>
              <li><Link to="/philosophy" className="nav-underline">Studio</Link></li>
              <li><Link to="/consultation" className="nav-underline">Consultation</Link></li>
            </ul>
          </div>
        </div>

        {/* Colophon: seal + provenance line */}
        <div className="mt-28 md:mt-40 pt-8 border-t border-foreground/10 grid md:grid-cols-12 items-end gap-8">
          <div className="md:col-span-3">
            <SiteSeal
              folio="MMXI"
              year={new Date().getFullYear()}
              provenance="AANGAN · KALA GHODA · MUMBAI"
              size={112}
            />
          </div>
          <div className="md:col-span-6">
            <p className="folio">Set in Instrument Serif &amp; Inter Tight · Printed to screen at 72 dpi</p>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-md">
              This site was hand-composed. All photography is representational
              of works in progress; final residence imagery is by commission.
            </p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="folio">© {new Date().getFullYear()} · Aangan Design Studio</p>
            <p className="folio mt-2">Mumbai · Bengaluru · Goa · Delhi NCR</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
