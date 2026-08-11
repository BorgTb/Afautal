"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

export type DashboardTabId = "convenios" | "deudas" | "finanzas" | "descuentos";

const TABS: { id: DashboardTabId; label: string }[] = [
  { id: "convenios", label: "Convenios" },
  { id: "deudas", label: "Deudas" },
  { id: "finanzas", label: "Estado financiero" },
  { id: "descuentos", label: "Descuentos" },
];

export default function DashboardTabs({
  activeTab,
  onTabChange,
  panels,
}: {
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
  panels: Record<DashboardTabId, ReactNode>;
}) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % TABS.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      } else {
        return;
      }
      event.preventDefault();
      onTabChange(TABS[nextIndex].id);
    },
    [onTabChange]
  );

  useEffect(() => {
    const activeButton = tabsRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`
    );
    activeButton?.focus({ preventScroll: true });
  }, [activeTab]);

  return (
    <section className="mt-8">
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Secciones del panel"
        className="mb-5 flex flex-wrap gap-2"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            data-tab={tab.id}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`portal-tab text-sm ${activeTab === tab.id ? "portal-tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {activeTab === tab.id && panels[tab.id]}
        </div>
      ))}
    </section>
  );
}

export { TABS };
