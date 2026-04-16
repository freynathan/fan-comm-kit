export function AIAdvantageStrip() {
  return (
    <section className="w-full py-12 md:py-[80px] px-6 bg-ds-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-[960px] mx-auto text-center">
          <p className="text-[15px] font-medium text-ds-text-primary mb-4 leading-[1.5]">
            While Meta and Instagram retrofit AI onto 2010 architectures — tobe.fan was born in the AI era.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["AI Search Ready", "Verified passion data", "Permanent indexed presence"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-medium bg-ds-accent-light text-ds-accent"
                style={{ letterSpacing: '0.04em' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
