import { Link } from "react-router-dom";
import { PassionWall } from "./PassionWall";

export function ContentHubSection() {
  return (
    <section className="w-full bg-white overflow-hidden" style={{ paddingTop: 72, paddingBottom: 24 }}>
      {/* Full-bleed Passion Wall */}
      <PassionWall />

      <div className="max-w-[1200px] mx-auto px-6 text-center" style={{ marginTop: 48 }}>
        <Link
          to="/feed"
          className="text-[13px] font-medium text-ds-text-tertiary hover:text-ds-text-primary transition-colors"
        >
          Explore all the latest posts →
        </Link>
      </div>
    </section>
  );
}
