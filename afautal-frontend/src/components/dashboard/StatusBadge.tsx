type StatusVariant = "ok" | "warn" | "bad";

const variantClass: Record<StatusVariant, string> = {
  ok: "portal-status-ok",
  warn: "portal-status-warn",
  bad: "portal-status-bad",
};

export default function StatusBadge({
  variant,
  children,
}: {
  variant: StatusVariant;
  children: React.ReactNode;
}) {
  return <span className={variantClass[variant]}>{children}</span>;
}
