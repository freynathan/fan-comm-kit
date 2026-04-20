import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
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
