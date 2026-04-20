import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-6 bg-white"
      style={{ border: "0.5px solid hsl(var(--color-border))" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium uppercase tracking-wider text-ds-text-tertiary">
          {label}
        </span>
        <Icon size={18} strokeWidth={1.5} className="text-ds-text-tertiary" />
      </div>
      <p className="text-[32px] font-semibold leading-none text-[#0A1628] tracking-[-0.5px]">
        {value}
      </p>
      {helper && <p className="text-[12px] text-ds-text-tertiary mt-2">{helper}</p>}
    </div>
  );
}
