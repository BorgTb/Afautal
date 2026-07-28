import StatusBadge from "./StatusBadge";

export default function PanelHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="m-0 text-2xl font-black text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        {badge}
      </div>
    </div>
  );
}

export function SecureSessionBadge() {
  return <StatusBadge variant="ok">Sesión segura</StatusBadge>;
}
