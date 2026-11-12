import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { images, materialLibrary, roomPhotos, type Img } from "../data";
import { EASE } from "../motion";
import { Arrow } from "./Logo";
import { Picture } from "./Picture";

type StudyMoment = {
  id: string;
  hour: string;
  title: string;
  altitude: string;
  render: Img;
  renderCaption: string;
  sectionTitle: string;
  principle: string;
  body: string;
  rayFrom: [number, number];
  rayTo: [number, number];
  shadowPolygon: string;
  breeze: boolean;
  rain?: boolean;
};

const moments: StudyMoment[] = [
  {
    id: "morning",
    hour: "07:30",
    title: "Morning",
    altitude: "22° East · Low angle",
    render: roomPhotos.courtyard,
    renderCaption: "Low morning light filtered across the colonnade and stone court.",
    sectionTitle: "East rays clear the roof parapet",
    principle: "Filtered morning warmth before daytime glare builds.",
    body: "Low sun enters through perforated jaali screens and warms the eastern colonnade, while the taller north massing holds cool shadow across the water edge.",
    rayFrom: [590, 42],
    rayTo: [265, 168],
    shadowPolygon: "155,168 238,168 215,176 155,176",
    breeze: true,
  },
  {
    id: "noon",
    hour: "12:30",
    title: "Noon",
    altitude: "78° Zenith · Direct",
    render: images.signature,
    renderCaption: "Deep concrete eaves hold permanent shade along the living edge.",
    sectionTitle: "Six-foot chhajja shields the glass line",
    principle: "Roof depth regulates internal heat without tinted glass.",
    body: "High midday sun meets a cantilevered verandah slab before touching interior glazing. Evaporative cooling from the still pool lowers air temperature drawn into the rooms.",
    rayFrom: [365, 14],
    rayTo: [330, 168],
    shadowPolygon: "155,168 250,168 250,176 155,176",
    breeze: true,
  },
  {
    id: "monsoon",
    hour: "16:00",
    title: "Monsoon",
    altitude: "Overcast · SW wind",
    render: images.monsoon,
    renderCaption: "The open court catches rain while surrounding verandahs stay dry.",
    sectionTitle: "Open aangan collects rain, cross-wings exhaust humidity",
    principle: "Deep plinths and sloping roofs protect lime plaster.",
    body: "Wind-driven rain enters the central court only, draining straight to recharge pits. Raised stone plinths and overhanging eaves let shutters remain open through the afternoon.",
    rayFrom: [85, 38],
    rayTo: [295, 168],
    shadowPolygon: "355,168 475,168 475,176 355,176",
    breeze: true,
    rain: true,
  },
  {
    id: "bluehour",
    hour: "18:30",
    title: "Blue hour",
    altitude: "4° Dusk · Thermal release",
    render: images.bluehour,
    renderCaption: "Natural stone and lime plaster cool rapidly as evening air settles.",
    sectionTitle: "Thermal stack lifts residual warmth out through the court",
    principle: "Thick masonry & breathable lime finish balance humidity.",
    body: "At dusk the warm upper air exits cleanly up the double-height courtyard volume while cooler coastal or garden air draws across the water court into sleeping quarters.",
    rayFrom: [45, 118],
    rayTo: [340, 118],
    shadowPolygon: "155,168 475,168 475,176 155,176",
    breeze: true,
  },
];

/**
 * Architectural daylight section + photorealistic moment sequence.
 * Replaces the primitive wireframe box with a real elevation section cut,
 * solar geometry diagram, studio renders, and material provenance.
 */
export function SunStudy() {
  const [activeId, setActiveId] = useState<string>(moments[0].id);
  const current = moments.find((m) => m.id === activeId) ?? moments[0];

  return (
    <div className="grid gap-10 lg:gap-12">
      {/* Upper grid: Photorealistic frame + interactive section study */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 grid gap-6">
          {/* Unobstructed studio render */}
          <figure>
            <div className="relative v2-media aspect-[16/10] bg-[var(--forest)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0.35, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.35 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Picture
                    image={current.render}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
              <span className="text-[0.875rem]" style={{ color: "var(--ink-2)" }}>
                {current.renderCaption}
              </span>
              <span className="v2-caption">Representational render</span>
            </figcaption>
          </figure>

          {/* True architectural cross-section cut driven by the selected hour */}
          <div
            className="p-5 md:p-6 v2-grid-bg"
            style={{
              backgroundColor: "#f3ede2",
              border: "1px solid var(--line)",
            }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
              <p className="v2-label">Section AA · Courtyard solar cut</p>
              <p className="v2-caption v2-num" style={{ color: "var(--terracotta)" }}>
                {current.altitude}
              </p>
            </div>

            <svg
              viewBox="0 0 640 215"
              className="w-full h-auto"
              role="img"
              aria-label={`Architectural cross-section at ${current.hour}: ${current.sectionTitle}`}
            >
              {/* Ground baseline */}
              <line x1="20" y1="176" x2="620" y2="176" stroke="#1b1f1a" strokeWidth="1.2" />

              {/* Raised plinth */}
              <rect
                x="56"
                y="168"
                width="528"
                height="8"
                fill="#dfd5c3"
                stroke="#1b1f1a"
                strokeWidth="0.9"
              />

              {/* West / Double-height North Wing (cut section solid) */}
              <rect
                x="66"
                y="72"
                width="96"
                height="96"
                fill="#e7decb"
                stroke="#1b1f1a"
                strokeWidth="1.25"
              />
              {/* Second floor slab line */}
              <line x1="66" y1="120" x2="162" y2="120" stroke="#1b1f1a" strokeWidth="1" />
              {/* Deep chhajja overhang over west verandah */}
              <path d="M52 72 L205 72 L205 79 L52 79 Z" fill="#1b1f1a" />
              <line x1="194" y1="79" x2="194" y2="168" stroke="#1b1f1a" strokeWidth="0.9" />

              {/* East Wing (single storey colonnade) */}
              <rect
                x="442"
                y="112"
                width="124"
                height="56"
                fill="#e7decb"
                stroke="#1b1f1a"
                strokeWidth="1.25"
              />
              {/* East cantilevered roof overhang */}
              <path d="M402 112 L578 112 L578 118 L402 118 Z" fill="#1b1f1a" />
              <line x1="414" y1="118" x2="414" y2="168" stroke="#1b1f1a" strokeWidth="0.9" />

              {/* Shallow courtyard water pool */}
              <rect x="278" y="165" width="82" height="4" fill="#4d5b43" opacity="0.7" />

              {/* Shade pocket moving cleanly by hour */}
              <polygon points={current.shadowPolygon} fill="#1b1f1a" opacity="0.16" />

              {/* Courtyard tree outline (fine architectural elevation stroke) */}
              <g stroke="#4d5b43" strokeWidth="0.9" fill="none" opacity="0.75">
                <line x1="252" y1="168" x2="252" y2="124" stroke="#5b4636" strokeWidth="1.2" />
                <path d="M252 132 L241 118 M252 128 L263 116" stroke="#5b4636" strokeWidth="0.9" />
                <ellipse cx="252" cy="108" rx="22" ry="15" fill="rgb(77 91 67 / 0.1)" />
              </g>

              {/* Monsoon rain dashes when rain mode */}
              {current.rain && (
                <g stroke="#4d5b43" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.55">
                  <line x1="245" y1="24" x2="225" y2="164" />
                  <line x1="295" y1="20" x2="275" y2="164" />
                  <line x1="345" y1="26" x2="325" y2="164" />
                  <line x1="388" y1="22" x2="368" y2="164" />
                </g>
              )}

              {/* Active Solar Vector */}
              {!current.rain && (
                <g>
                  <line
                    x1={current.rayFrom[0]}
                    y1={current.rayFrom[1]}
                    x2={current.rayTo[0]}
                    y2={current.rayTo[1]}
                    stroke="#a3462a"
                    strokeWidth="1.4"
                    strokeDasharray="5 4"
                  />
                  <circle cx={current.rayFrom[0]} cy={current.rayFrom[1]} r="6" fill="#a3462a" />
                </g>
              )}

              {/* Cross-ventilation stack arrow through courtyard */}
              {current.breeze && (
                <path
                  d="M210 144 Q 305 138 308 82"
                  fill="none"
                  stroke="#4d5b43"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              )}

              {/* Clean Section Labels */}
              <g
                fill="rgb(27 31 26 / 0.65)"
                style={{ font: "600 9.5px var(--f-sans)", letterSpacing: "0.1em" }}
              >
                <text x="114" y="196" textAnchor="middle">
                  TWO-STOREY WING
                </text>
                <text x="304" y="196" textAnchor="middle">
                  OPEN AANGAN &amp; POOL
                </text>
                <text x="504" y="196" textAnchor="middle">
                  EAST COLONNADE
                </text>
              </g>
            </svg>
            <p className="text-[0.84rem] mt-2" style={{ color: "var(--ink-2)" }}>
              {current.sectionTitle} —{" "}
              <span style={{ color: "var(--ink)" }}>{current.principle}</span>
            </p>
          </div>
        </div>

        {/* Right column: Time of day sequence + Material Bench */}
        <div className="lg:col-span-5 grid gap-8">
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {moments.map((m) => {
              const active = m.id === current.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveId(m.id)}
                  aria-pressed={active}
                  className="w-full text-left py-4 px-1 flex items-baseline justify-between gap-4 cursor-pointer transition-colors duration-300"
                  style={{
                    borderBottom: "1px solid var(--line)",
                    color: active ? "var(--ink)" : "var(--ink-3)",
                  }}
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      className="v2-num text-[0.8125rem] font-semibold"
                      style={{ color: active ? "var(--terracotta)" : "inherit" }}
                    >
                      {m.hour}
                    </span>
                    <span
                      className="text-[1.6rem] leading-none"
                      style={{ fontFamily: "var(--f-display)" }}
                    >
                      {m.title}
                    </span>
                  </span>
                  <span className="v2-caption">
                    {active ? "Inspecting" : m.altitude.split(" · ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="p-6 md:p-7"
            style={{ background: "var(--ivory)", border: "1px solid var(--line)" }}
            aria-live="polite"
          >
            <p className="v2-label" style={{ color: "var(--terracotta)" }}>
              {current.hour} · {current.title} response
            </p>
            <p
              className="mt-3 text-[1.45rem] leading-[1.2]"
              style={{ fontFamily: "var(--f-display)" }}
            >
              {current.principle}
            </p>
            <p className="v2-body mt-3">{current.body}</p>
          </div>

          {/* Real Material Palette from the Studio Library */}
          <div>
            <p className="v2-label mb-3">Materials tuned to sun &amp; monsoon</p>
            <div className="grid grid-cols-3 gap-3">
              {materialLibrary.map((mat) => (
                <div key={mat.name}>
                  <div className="v2-media aspect-square">
                    <Picture
                      image={mat.image}
                      sizes="140px"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-[0.82rem] font-medium leading-tight">{mat.name}</p>
                  <p
                    className="text-[0.72rem] mt-0.5 leading-snug"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {mat.origin}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link to="/v2/enquire" search={{ visit: true }} className="v2-btn v2-btn--ink">
              Request a sun &amp; site study <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
