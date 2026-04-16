export function AIAdvantageStrip() {
  return (
    <section className="w-full py-8 px-6" style={{ backgroundColor: "#E6F1FB" }}>
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[15px] font-bold text-[hsl(var(--navy))] mb-3">
          While Meta and Instagram retrofit AI onto 2010 architectures — tobe.fan was born in the AI era.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {["AI Search Ready", "Verified passion data", "Permanent indexed presence"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-white/60 text-[hsl(var(--navy))]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
