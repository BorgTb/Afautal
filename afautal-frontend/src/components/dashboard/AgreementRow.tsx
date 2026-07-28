import StatusBadge from "./StatusBadge";

type StatusVariant = "ok" | "warn" | "bad";

export default function AgreementRow({
  title,
  description,
  statusLabel,
  statusVariant,
  action,
}: {
  title: string;
  description: string;
  statusLabel: string;
  statusVariant: StatusVariant;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h4 className="m-0 mb-1 text-base font-bold text-slate-900">{title}</h4>
        <p className="m-0 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
        {action}
      </div>
    </div>
  );
}
