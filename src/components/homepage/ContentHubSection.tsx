import { Link } from "react-router-dom";
import { PassionWall } from "./PassionWall";

export function ContentHubSection() {
  return (
    <section className="w-full py-20 md:py-[120px] bg-ds-surface overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[16px] font-medium tracking-[0.08em] uppercase text-[#0C447C] mb-4">
            Latest from the network
          </p>
          <h2 className="text-[48px] font-semibold text-ds-text-primary leading-[1.2] tracking-[-0.8px] mb-5">
            Every passion. One hub.
          </h2>
          <p className="text-[15px] font-normal leading-[1.7] text-ds-text-tertiary mb-12 max-w-2xl mx-auto">
            AI-powered content published here first — dispatched to the communities that care most.
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
