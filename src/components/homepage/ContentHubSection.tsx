import { Link } from "react-router-dom";
import { PassionWall } from "./PassionWall";

export function ContentHubSection() {
  return (
    <section className="w-full bg-white overflow-hidden" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Full-bleed Passion Wall */}
      <PassionWall />

      <div className="max-w-[1200px] mx-auto px-6 text-center" style={{ marginTop: 40 }}>
        <Link
          to="/feed"
          className="text-[13px] font-medium text-ds-text-tertiary hover:text-ds-text-primary transition-colors"
        >
          Explore all posts →
        </Link>
      </div>
    </section>
  );
}
