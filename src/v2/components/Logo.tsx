/**
 * The Aangan mark: a chamfered courtyard enclosure opening on the south
 * threshold, framing a pitched sanctuary portal and faceted courtyard diamond.
 * Optical geometry stays crisp from 18px navigation scale to 44px+ footer seals.
 */
export function Mark({ size = 28, tree = true }: { size?: number; tree?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none" }}
    >
      {/* Outer chamfered courtyard walls with south entry portal */}
      <path
        d="M12 27.5H8.5L4.5 23.5V8.5L8.5 4.5H23.5L27.5 8.5V23.5L23.5 27.5H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Inner architectural gable framing the aangan */}
      <path
        d="M12 23H9V11.6L16 8.2L23 11.6V23H20"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.68"
        strokeWidth="1.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Central faceted courtyard stone */}
      {tree && (
        <>
          <path d="M16 12.4L19.8 16.2L16 20L12.2 16.2Z" fill="var(--terracotta, #a3462a)" />
          <path
            d="M16 14.9L17.3 16.2L16 17.5L14.7 16.2Z"
            fill="var(--brass, #d2ae6d)"
            fillOpacity="0.92"
          />
        </>
      )}
    </svg>
  );
}

export function Logo({
  compact = false,
  devanagari = true,
}: {
  compact?: boolean;
  devanagari?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "0.68rem" : "0.85rem",
      }}
    >
      <Mark size={compact ? 22 : 28} />
      <span
        style={{
          fontFamily: "var(--f-display)",
          fontSize: compact ? "1.25rem" : "1.55rem",
          letterSpacing: "0.26em",
          lineHeight: 1,
          marginRight: "-0.26em",
        }}
      >
        AANGAN
      </span>
      {devanagari && (
        <span
          aria-hidden="true"
          className="hidden sm:inline-flex items-center"
          style={{
            fontFamily: '"Noto Serif Devanagari", serif',
            fontSize: compact ? "0.78rem" : "0.9rem",
            lineHeight: 1,
            paddingLeft: "0.7rem",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "12%",
              bottom: "12%",
              width: "1px",
              background: "currentColor",
              opacity: 0.28,
            }}
          />
          <span style={{ opacity: 0.68 }}>आँगन</span>
        </span>
      )}
    </span>
  );
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
