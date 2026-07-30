import type { LucideIcon } from "lucide-react";

export default function QuickServiceCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="portal-card flex flex-col">
      <div className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-sky-50 text-[#BF0F0F]">
        <Icon size={22} />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mb-5 min-h-[48px] flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
      <button type="button" onClick={onAction} className="portal-btn-secondary self-start">
        {buttonLabel}
      </button>
    </div>
  );
}
