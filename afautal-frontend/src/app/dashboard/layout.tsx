import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full pb-12">
      <div className="mx-auto max-w-[1200px] px-5 py-8">{children}</div>
    </div>
  );
}
