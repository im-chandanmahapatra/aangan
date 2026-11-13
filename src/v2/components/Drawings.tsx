import type { Listing } from "@/v2/data";
import { PlotPlate } from "./PlotPlate";

/**
 * Placeholder floor plan drawing.
 * Replace with real SVG architectural drawings per plan type.
 */
export function FloorPlan({ plan, className }: { plan?: string; className?: string }) {
  return (
    <div className={className} style={{ display: "grid", placeItems: "center" }}>
      <p className="v2-label" style={{ opacity: 0.4 }}>
        {plan ? `${plan} floor plan` : "Floor plan"} — drawing coming soon
      </p>
    </div>
  );
}

export function SitePlan({ listing, className }: { listing?: Listing; className?: string }) {
  if (listing?.plot) {
    return <PlotPlate listing={listing} className={className} />;
  }

  return (
    <div className={className} style={{ display: "grid", placeItems: "center" }}>
      <p className="v2-label" style={{ opacity: 0.4 }}>
        Site dimensions are not available for this listing.
      </p>
    </div>
  );
}
