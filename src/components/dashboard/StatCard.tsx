interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  accentColor: string;
}

export function StatCard({ label, value, helper, accentColor }: StatCardProps) {
  return (
    <div
      className="rounded-xl bg-white p-5 relative overflow-hidden"
      style={{ border: "0.5px solid #E5E5E5" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: accentColor }}
      />
      <p className="text-[40px] font-semibold leading-none text-[#0A1628] tracking-[-0.5px] mt-1">
        {value}
      </p>
      <p className="text-[12px] text-ds-text-tertiary mt-3 uppercase tracking-wider font-medium">
        {label}
      </p>
      {helper && <p className="text-[11px] text-ds-text-tertiary mt-1.5">{helper}</p>}
    </div>
  );
}
