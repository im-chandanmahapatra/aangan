import { Link } from "@tanstack/react-router";
import "./footer.css";

/**
 * Editorial Architectural Footer
 * Single Visual Source of Truth: Reference reproduction (media_1794547878659_1767147d.jpg)
 * Palette:
 *   Forest black: #0B1510
 *   Deep green:   #101A14
 *   Warm ivory:   #EEE6D7
 *   Laterite red: #A34B2B
 *   Muted brass:  #B89B62
 *   Fine divider: rgba(184, 155, 98, 0.42)
 */

function CoordinateIcon() {
  return (
    <svg
      className="footer-coord-icon"
      viewBox="0 0 14 14"
      fill="none"
      stroke="#B89B62"
      strokeWidth="1.15"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="3.2" />
      <line x1="7" y1="0.5" x2="7" y2="3" />
      <line x1="7" y1="11" x2="7" y2="13.5" />
      <line x1="0.5" y1="7" x2="3" y2="7" />
      <line x1="11" y1="7" x2="13.5" y2="7" />
    </svg>
  );
}

function ArrowThin() {
  return (
    <svg
      className="footer-btn-arrow"
      width="22"
      height="12"
      viewBox="0 0 24 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="21" y2="6" />
      <polyline points="15.5,1 21,6 15.5,11" />
    </svg>
  );
}

function TopographyCurves() {
  return (
    <svg
      className="footer-topography"
      viewBox="0 0 520 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M-40,210 C40,195 120,225 210,205 C290,188 380,210 480,192 C530,182 580,198 620,185"
        stroke="rgba(184, 155, 98, 0.28)"
        strokeWidth="1"
      />
      <path
        d="M-40,180 C50,160 140,192 230,172 C310,152 400,178 500,160 C550,150 600,165 640,155"
        stroke="rgba(184, 155, 98, 0.24)"
        strokeWidth="1"
      />
      <path
        d="M-40,150 C40,128 130,160 220,140 C300,120 390,145 490,128 C540,118 590,135 630,125"
        stroke="rgba(184, 155, 98, 0.20)"
        strokeWidth="1"
      />
      <path
        d="M-40,120 C60,95 150,128 240,105 C320,85 410,112 510,95 C560,86 610,102 650,92"
        stroke="rgba(184, 155, 98, 0.16)"
        strokeWidth="1"
      />
      <path
        d="M-40,90 C45,68 135,100 225,75 C305,52 395,80 495,62 C545,54 595,70 635,60"
        stroke="rgba(184, 155, 98, 0.12)"
        strokeWidth="1"
      />
      <path
        d="M-40,60 C55,38 145,70 235,45 C315,22 405,50 505,32 C555,24 605,40 645,30"
        stroke="rgba(184, 155, 98, 0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="aangan-footer" aria-label="Aangan Site Footer">
      {/* ====================================================================
          SECTION 1 — CINEMATIC CTA
          ==================================================================== */}
      <section className="footer-cta-section" aria-labelledby="footer-cta-heading">
        <div className="footer-cta-bg-layer" aria-hidden="true">
          <img
            src="/v2/footer/footer-bg.webp"
            alt=""
            className="footer-cta-bg-img"
            loading="lazy"
            decoding="async"
          />
          <div className="footer-cta-gradient" />
          <TopographyCurves />
        </div>

        <div className="footer-cta-content">
          <div className="footer-cta-top">
            {/* Wordmark */}
            <p className="footer-wordmark">A A N G A N</p>

            {/* Brass accent divider */}
            <div className="footer-brass-stroke" aria-hidden="true" />

            {/* Eyebrow label */}
            <p className="footer-eyebrow">PRIVATE VIEWINGS · BY APPOINTMENT</p>

            {/* Exact two-line headline */}
            <h2 id="footer-cta-heading" className="footer-headline">
              <span>Some places are viewed.</span>
              <span>This one is felt.</span>
            </h2>

            {/* CTAs */}
            <div className="footer-actions">
              <Link to="/v2/enquire" search={{ visit: true }} className="footer-btn-primary">
                <span>ARRANGE A PRIVATE WALK</span>
                <ArrowThin />
              </Link>

              <Link
                to="/v2/enquire"
                search={{ interest: "land" }}
                className="footer-link-secondary"
              >
                REQUEST THE PROPERTY DOSSIER
              </Link>
            </div>
          </div>

          {/* Coordinates Detail */}
          <div className="footer-coordinates">
            <CoordinateIcon />
            <span>11.6819° N, 92.7465° E</span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2 — INFORMATION BAND
          ==================================================================== */}
      <section className="footer-info-band" aria-label="Aangan directory and links">
        <div className="footer-info-inner">
          {/* Three columns separated by thin vertical brass rules */}
          <div className="footer-columns">
            {/* Column 1 — EXPLORE */}
            <div className="footer-col footer-col-1">
              <p className="footer-col-header">EXPLORE</p>
              <nav className="footer-links-row" aria-label="Explore properties">
                <Link to="/v2/homes" className="footer-nav-link">
                  Homes
                </Link>
                <Link to="/v2/collection" search={{ kind: "plot" }} className="footer-nav-link">
                  Land
                </Link>
                <Link to="/v2/interiors" className="footer-nav-link">
                  Interiors
                </Link>
                <Link to="/v2/studio" className="footer-nav-link">
                  Our approach
                </Link>
              </nav>
            </div>

            {/* Column 2 — PLACES */}
            <div className="footer-col footer-col-2">
              <p className="footer-col-header">PLACES</p>
              <nav className="footer-links-row" aria-label="Regions and locations">
                <Link
                  to="/v2/collection"
                  search={{ city: "Bhubaneswar" }}
                  className="footer-nav-link"
                >
                  Odisha
                </Link>
                <Link
                  to="/v2/collection"
                  search={{ city: "Bengaluru" }}
                  className="footer-nav-link"
                >
                  Bengaluru
                </Link>
                <Link to="/v2/collection" search={{ city: "Mumbai" }} className="footer-nav-link">
                  Mumbai
                </Link>
              </nav>
            </div>

            {/* Column 3 — VISIT & WRITE */}
            <div className="footer-col footer-col-3">
              <p className="footer-col-header">VISIT &amp; WRITE</p>
              <div className="footer-links-row">
                <a href="mailto:hello@aangan.in" className="footer-nav-link">
                  hello@aangan.in
                </a>
                <a href="tel:+910000000000" className="footer-nav-link">
                  +91 00000 00000
                </a>
              </div>
            </div>
          </div>

          {/* Thin horizontal divider */}
          <div className="footer-divider-rule" aria-hidden="true" />

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <p className="footer-bottom-brand-phrase">Land · House · Place</p>

            <div className="footer-bottom-links">
              <span className="footer-bottom-item">© 2026 Aangan</span>
              <a href="#privacy" className="footer-bottom-item">
                Privacy
              </a>
              <a href="#legal" className="footer-bottom-item">
                Legal
              </a>
              <a
                href="https://instagram.com/aangan"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-bottom-item"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
