import { Link } from "react-router-dom";
import { PassionWall } from "./PassionWall";

export function ContentHubSection() {
  return (
    <section className="w-full py-20 md:py-[120px] bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[16px] font-medium tracking-[0.08em] uppercase text-[#0C447C]" style={{ marginBottom: 24 }}>
            Latest from the network
          </p>
        </div>
      </div>

      {/* Full-bleed Passion Wall */}
      <PassionWall />

      <div className="max-w-[1200px] mx-auto px-6 text-center mt-10">
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
