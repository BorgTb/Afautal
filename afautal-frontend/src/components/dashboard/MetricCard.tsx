export default function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="portal-card">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="my-2.5 text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{note}</div>
    </div>
  );
}
