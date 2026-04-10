const columns = [
  {
    title: "Communities",
    links: [
      { label: "cocktail.fan", href: "https://cocktail.fan" },
      { label: "car.fan", href: "https://car.fan" },
      { label: "yoga.fan", href: "https://yoga.fan" },
      { label: "View all 22 →", href: "https://tobe.fan/communities" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "tobe.fan profile", href: "https://tobe.fan/profile" },
      { label: "Fan Relate", href: "https://tobe.fan/relate" },
      { label: "Fan clubs", href: "https://tobe.fan/clubs" },
      { label: "For brands", href: "https://tobe.fan/brands" },
    ],
  },
  {
    title: "Creators",
    links: [
      { label: "Free bio link", href: "https://tobe.fan/bio" },
      { label: "Brand collabs", href: "https://tobe.fan/collabs" },
      { label: "Earn with clubs", href: "https://tobe.fan/earn" },
      { label: "Creator guide", href: "https://tobe.fan/guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About tobe.fan", href: "https://tobe.fan/about" },
      { label: "Investor deck", href: "https://tobe.fan/investors" },
      { label: "Privacy", href: "https://tobe.fan/privacy" },
      { label: "Contact", href: "https://tobe.fan/contact" },
    ],
  },
];

export function SharedFooter() {
  return (
    <footer className="w-full bg-white" style={{ borderTop: "1px solid #eee" }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-semibold mb-3" style={{ color: "#0A1628" }}>
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] transition-colors hover:text-[#0A1628]"
                      style={{ color: "#6b7280" }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6"
          style={{ borderTop: "1px solid #eee" }}
        >
          <span className="text-[12px]" style={{ color: "#9ca3af" }}>
            © 2025 ToBe.fan · Come for the passion. Relate with fellow fans. Convert your social clout into passive income, forever.
          </span>
          <a href="https://tobe.fan" className="text-[13px] font-bold" style={{ color: "#0C447C" }}>
            tobe.fan
          </a>
        </div>
      </div>
    </footer>
  );
}
