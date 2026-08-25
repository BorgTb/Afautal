"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  parseISO,
  getMonth,
  getYear,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar } from "lucide-react";
import "@/lib/gsap-setup";
import gsap from "gsap";

export interface CalendarActivityData {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  ubicacion?: string;
  tipo?: string;
  imagen?: { url?: string; alternativeText?: string } | null;
}

interface Props {
  data: CalendarActivityData[];
  hideTitle?: boolean;
  detailed?: boolean;
}

const TIPO_COLORS: Record<string, string> = {
  Charla: "bg-blue-100 text-blue-800",
  "Reuni\u00f3n": "bg-purple-100 text-purple-800",
  Taller: "bg-green-100 text-green-800",
  Evento: "bg-amber-100 text-amber-800",
  "Capacitaci\u00f3n": "bg-teal-100 text-teal-800",
  Asamblea: "bg-red-100 text-red-800",
  Otro: "bg-slate-100 text-slate-800",
};

const TIPO_ICONS: Record<string, string> = {
  Charla: "\u{1F4AC}",
  "Reuni\u00f3n": "\u{1F91D}",
  Taller: "\u{1F527}",
  Evento: "\u{1F389}",
  "Capacitaci\u00f3n": "\u{1F4DA}",
  Asamblea: "\u{1F3F1}",
  Otro: "\u{1F4CB}",
};

function CalendarGrid({
  currentMonth,
  selectedDate,
  activityDates,
  onDateSelect,
  gridRef,
}: {
  currentMonth: Date;
  selectedDate: Date;
  activityDates: Set<string>;
  onDateSelect: (d: Date) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div ref={gridRef}>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-2 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const selected = isSameDay(day, selectedDate);
          const hasActivity = activityDates.has(key);

          return (
            <button
              key={key}
              data-day-index={i}
              onClick={() => onDateSelect(day)}
              className={`
                relative flex items-center justify-center h-10 text-sm rounded-full transition-all duration-150
                ${!inMonth ? "text-slate-200" : ""}
                ${selected ? "bg-[#BF0F0F] text-white font-bold shadow-md scale-105 animate-pulse-ring" : ""}
                ${!selected && inMonth ? "hover:bg-slate-100 text-slate-800" : ""}
                ${!selected && !inMonth ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {format(day, "d")}
              {hasActivity && (
                <span
                  className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                    selected ? "bg-white" : "bg-[#BF0F0F]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActivitiesList({
  activities,
  compact,
  detailed,
  listRef,
}: {
  activities: CalendarActivityData[];
  compact?: boolean;
  detailed?: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Calendar className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-medium">No hay actividades en esta fecha</p>
        <p className="text-xs mt-1">Selecciona otro d&iacute;a para ver actividades</p>
      </div>
    );
  }

  const grouped = activities.reduce<Record<string, CalendarActivityData[]>>((acc, a) => {
    const key = a.fecha;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const displayedDates = compact ? sortedDates.slice(0, 5) : sortedDates;

  return (
    <div ref={listRef} className="space-y-3">
      {displayedDates.map((dateKey, dateIdx) => (
        <div key={dateKey} data-date-idx={dateIdx}>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            {detailed ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BF0F0F]" />
                {format(parseISO(dateKey), "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </span>
            ) : (
              format(parseISO(dateKey), "d 'de' MMMM, yyyy", { locale: es })
            )}
          </h4>
          <div className="space-y-2">
            {grouped[dateKey].map((act, actIdx) => (
              <div
                key={act.id}
                data-card-idx={`${dateIdx}-${actIdx}`}
                className={`act-card group flex items-start gap-3 rounded-xl border border-slate-100 bg-white ${
                  detailed
                    ? "animate-card-lift p-4 sm:p-5 border-l-4 border-l-transparent hover:border-l-[#BF0F0F]"
                    : "p-3"
                }`}
              >
                {detailed ? (
                  <>
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="bg-[#BF0F0F] text-white rounded-t-lg py-1 text-[9px] font-bold uppercase leading-tight tracking-wider">
                        {format(parseISO(act.fecha), "MMM", { locale: es })}
                      </div>
                      <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg py-1.5 text-lg font-bold text-slate-900">
                        {format(parseISO(act.fecha), "d")}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {act.tipo && (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              TIPO_COLORS[act.tipo] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {act.tipo}
                          </span>
                        )}
                        {act.hora && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" /> {act.hora}
                          </span>
                        )}
                      </div>
                      <h5 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#BF0F0F] transition-colors">
                        {act.titulo}
                      </h5>
                      {act.descripcion && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {act.descripcion}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                        {act.hora && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {act.hora}
                          </span>
                        )}
                        {act.ubicacion && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {act.ubicacion}
                          </span>
                        )}
                      </div>
                    </div>
                    {act.imagen?.url && (
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 self-start">
                        <img
                          src={act.imagen.url}
                          alt={act.imagen.alternativeText || act.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <span className="flex-shrink-0 mt-0.5 text-lg leading-none">
                      {act.tipo && TIPO_ICONS[act.tipo] ? TIPO_ICONS[act.tipo] : "\u{1F4CB}"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {act.tipo && (
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              TIPO_COLORS[act.tipo] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {act.tipo}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug group-hover:text-[#BF0F0F] transition-colors">
                        {act.titulo}
                      </h5>
                      {act.descripcion && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {act.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        {act.hora && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.hora}
                          </span>
                        )}
                        {act.ubicacion && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {act.ubicacion}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {compact && sortedDates.length > 5 && (
        <p className="text-xs text-center text-slate-400 pt-1">
          +{sortedDates.length - 5} actividades m&aacute;s &mdash;
          <a href="/actividades" className="text-[#BF0F0F] font-semibold hover:underline ml-1">
            Ver todas
          </a>
        </p>
      )}
    </div>
  );
}

export default function CalendarActivities({ data, hideTitle, detailed }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const calendarWrapRef = useRef<HTMLDivElement>(null);
  const monthLabelRef = useRef<HTMLHeadingElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    if (data.length > 0) {
      const parsed = data.map((d) => parseISO(d.fecha));
      const future = parsed.filter((d) => !isBefore(d, today));
      if (future.length > 0) return future.sort((a, b) => a.getTime() - b.getTime())[0];
    }
    return today;
  });

  const [animating, setAnimating] = useState(false);

  const activityDates = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => {
      if (a.fecha) set.add(a.fecha);
    });
    return set;
  }, [data]);

  const filteredActivities = useMemo(() => {
    return data
      .filter((a) => {
        const d = parseISO(a.fecha);
        return !isBefore(d, selectedDate);
      })
      .sort((a, b) => parseISO(a.fecha).getTime() - parseISO(b.fecha).getTime());
  }, [data, selectedDate]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {}, section);
    ctxRef.current = ctx;

    if (!detailed) {
      if (gridRef.current) {
        ctx.add(() => {
          gsap.fromTo(
            gridRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
              scrollTrigger: { trigger: section, start: "top 80%" }
            }
          );
        });
      }
      if (listRef.current) {
        ctx.add(() => {
          gsap.fromTo(
            listRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
              scrollTrigger: { trigger: section, start: "top 80%" }
            }
          );
        });
      }
    }

    const cards = section.querySelectorAll(".act-card");
    if (cards.length > 0) {
      ctx.add(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cards[0],
              start: "top 85%",
            },
          }
        );
      });
    }

    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
  }, [detailed]);

  useEffect(() => {
    if (animating || !ctxRef.current) return;

    const timer = setTimeout(() => {
      if (!ctxRef.current) return;
      const section = sectionRef.current;
      if (!section) return;
      const cards = section.querySelectorAll(".act-card");
      if (cards.length > 0) {
        ctxRef.current.add(() => {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              stagger: 0.06,
              ease: "power3.out",
              scrollTrigger: {
                trigger: cards[0],
                start: "top 85%",
              },
            }
          );
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedDate, filteredActivities, animating]);

  useEffect(() => {
    if (!ctxRef.current) return;
    const cells = gridRef.current?.querySelectorAll("button");
    if (cells && cells.length > 0) {
      ctxRef.current.add(() => {
        gsap.fromTo(
          cells,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.015, ease: "power2.out" }
        );
      });
    }
  }, [currentMonth]);

  const changeMonth = useCallback((dir: "prev" | "next") => {
    if (animating) return;
    setAnimating(true);
    const grid = gridRef.current;
    if (grid && ctxRef.current) {
      ctxRef.current.add(() => {
        gsap.to(grid, {
          opacity: 0,
          y: dir === "next" ? -12 : 12,
          duration: 0.15,
          ease: "power2.in",
          onComplete: () => {
            setCurrentMonth((m) => (dir === "next" ? addMonths(m, 1) : subMonths(m, 1)));
            if (monthLabelRef.current) {
              gsap.fromTo(
                monthLabelRef.current,
                { opacity: 0, y: dir === "next" ? -8 : 8 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
              );
            }
            gsap.set(grid, { y: dir === "next" ? 12 : -12 });
            gsap.to(grid, {
              opacity: 1,
              y: 0,
              duration: 0.25,
              ease: "power2.out",
              onComplete: () => setAnimating(false),
            });
          },
        });
      });
    }
  }, [animating]);

  const handleDateSelect = useCallback((day: Date) => {
    setSelectedDate(day);
    if (!ctxRef.current) return;
    const section = sectionRef.current;
    if (!section) return;
    const cards = section.querySelectorAll(".act-card");
    if (cards.length > 0) {
      ctxRef.current.add(() => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 16, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" }
        );
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10">
      {!hideTitle && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Pr&oacute;ximas Actividades
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Mantente al d&iacute;a con los eventos y reuniones de AFAUTAL
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] lg:gap-10">
        <div ref={calendarWrapRef} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth("prev")}
              disabled={animating}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#BF0F0F] transition-all disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 ref={monthLabelRef} className="text-sm font-bold text-slate-900">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <button
              onClick={() => changeMonth("next")}
              disabled={animating}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#BF0F0F] transition-all disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            activityDates={activityDates}
            onDateSelect={handleDateSelect}
            gridRef={gridRef}
          />
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#BF0F0F] animate-dot-pulse" />
            <span>D&iacute;as con actividades</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Actividades desde{" "}
              <span className="text-slate-900">
                {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </span>
            </h3>
            {!detailed && (
              <a
                href="/actividades"
                className="text-xs font-semibold text-[#BF0F0F] hover:underline hidden sm:inline"
              >
                Ver calendario completo
              </a>
            )}
          </div>
          <ActivitiesList activities={filteredActivities} compact={!detailed} detailed={detailed} listRef={listRef} />
        </div>
      </div>
    </section>
  );
}
