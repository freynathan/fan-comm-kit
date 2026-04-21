import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  if (compact) {
    return (
      <div
        className="rounded-xl bg-white px-5 py-4 flex items-center gap-4"
        style={{ border: "0.5px solid #E5E5E5", maxHeight: 160 }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#F5F5F7" }}
        >
          <Icon size={18} strokeWidth={1.5} className="text-ds-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#0A1628] truncate">{title}</p>
          <p className="text-[12px] text-ds-text-tertiary truncate">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-12 flex flex-col items-center text-center bg-white"
      style={{ border: "0.5px solid hsl(var(--color-border))" }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ backgroundColor: "#F5F5F7" }}
      >
        <Icon size={24} strokeWidth={1.5} className="text-ds-text-secondary" />
      </div>
      <h3 className="text-[18px] font-semibold text-[#0A1628] mb-2">{title}</h3>
      <p className="text-[14px] text-ds-text-tertiary max-w-[360px] mb-6">{description}</p>
      {action}
    </div>
  );
}
