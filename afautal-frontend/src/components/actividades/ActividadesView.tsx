"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  parseISO,
  getMonth,
  getYear,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Calendar,
  X,
  CalendarDays,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CalendarActivityData } from "@/components/landing-page/CalendarActivities";

gsap.registerPlugin(ScrollTrigger);

const TIPO_COLORS: Record<string, string> = {
  Charla: "bg-blue-100 text-blue-800",
  "Reuni\u00f3n": "bg-purple-100 text-purple-800",
  Taller: "bg-green-100 text-green-800",
  Evento: "bg-amber-100 text-amber-800",
  "Capacitaci\u00f3n": "bg-teal-100 text-teal-800",
  Asamblea: "bg-red-100 text-red-800",
  Otro: "bg-slate-100 text-slate-800",
};

interface Props {
  data: CalendarActivityData[];
  monthStats: { month: number; year: number; count: number }[];
  typeStats: { tipo: string; count: number }[];
  totalCount: number;
}

export default function ActividadesView({ data, monthStats, typeStats, totalCount }: Props) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const activityDates = useMemo(() => {
    const set = new Set<string>();
    data.forEach((a) => { if (a.fecha) set.add(a.fecha); });
    return set;
  }, [data]);

  const filteredActivities = useMemo(() => {
    let sorted = [...data].sort(
      (a, b) => parseISO(a.fecha).getTime() - parseISO(b.fecha).getTime()
    );
    if (selectedDate) {
      sorted = sorted.filter(
        (a) => a.fecha && isSameDay(parseISO(a.fecha), selectedDate)
      );
    }
    return sorted;
  }, [data, selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const handleDateSelect = (day: Date) => {
    if (selectedDate && isSameDay(day, selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: headerRef.current, start: "top 85%" }
          }
        );
      }
      if (calendarRef.current) {
        gsap.fromTo(
          calendarRef.current,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, ease: "power3.out",
            scrollTrigger: { trigger: calendarRef.current, start: "top 80%" }
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cards = cardsGridRef.current?.querySelectorAll(".act-card-item");
    if (cards && cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: cardsGridRef.current, start: "top 85%" }
        }
      );
    }
  }, [filteredActivities]);

  const hasActivitiesInMonth = days.some((d) => activityDates.has(format(d, "yyyy-MM-dd")));

  const MONTHS_LABEL = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  return (
    <div className="min-h-screen bg-[#fcfafa]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-10">
        {/* ── Header ── */}
        <div ref={headerRef}>
          <div className="mb-10 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-[#BF0F0F] mb-4">
              <CalendarDays className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl display-title">
              Calendario de Actividades
            </h1>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
              Explor&aacute; el listado completo de actividades de AFAUTAL.
              Us&aacute; el calendario para filtrar por fechas espec&iacute;ficas.
            </p>
          </div>

          {totalCount > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-[#BF0F0F] border border-red-100">
                <span className="flex h-2 w-2 rounded-full bg-[#BF0F0F]" />
                {totalCount} actividad{totalCount !== 1 ? "es" : ""}
              </span>
              {monthStats.slice(0, 4).map((m) => (
                <span
                  key={`${m.year}-${m.month}`}
                  className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {MONTHS_LABEL[m.month]} {m.year} ({m.count})
                </span>
              ))}
              {typeStats.slice(0, 3).map((t) => (
                <span
                  key={t.tipo}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                    TIPO_COLORS[t.tipo] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t.tipo}
                  <span className="ml-1 opacity-60">{t.count}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* ── Cards column ── */}
          <div>
            {selectedDate && (
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {filteredActivities.length}
                  </span>{" "}
                  actividad{filteredActivities.length !== 1 ? "es" : ""} del{" "}
                  <span className="font-semibold text-slate-900">
                    {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#BF0F0F] hover:underline"
                >
                  <X className="w-3 h-3" /> Mostrar todas
                </button>
              </div>
            )}

            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Calendar className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-sm font-medium">
                  {selectedDate
                    ? "No hay actividades en esta fecha"
                    : "No hay actividades registradas"}
                </p>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="mt-3 text-xs font-semibold text-[#BF0F0F] hover:underline"
                  >
                    Ver todas las actividades
                  </button>
                )}
              </div>
            ) : (
              <div
                ref={cardsGridRef}
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredActivities.map((act, index) => (
                  <article
                    key={act.id}
                    className="act-card-item overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-red-200"
                  >
                    {act.imagen?.url && (
                      <div className="h-36 overflow-hidden">
                        <img
                          src={act.imagen.url}
                          alt={act.imagen.alternativeText || act.titulo}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {act.tipo && (
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              TIPO_COLORS[act.tipo] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {act.tipo}
                          </span>
                        )}
                        {act.hora && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" /> {act.hora}
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-bold text-slate-900 leading-snug">
                        {act.titulo}
                      </h2>

                      <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {format(parseISO(act.fecha), "d MMM yyyy", { locale: es })}
                      </p>

                      {act.ubicacion && (
                        <p className="mt-0.5 text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {act.ubicacion}
                        </p>
                      )}

                      {act.descripcion && (
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {act.descripcion}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* ── Calendar sidebar ── */}
          <aside ref={calendarRef} className="lg:sticky lg:top-24 self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPrevMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#BF0F0F] transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <h3 className="text-xs font-bold text-slate-900">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h3>
                <button
                  onClick={goToNextMonth}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#BF0F0F] transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0 mb-0.5">
                {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-semibold text-slate-400 py-1.5 uppercase tracking-wider"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0">
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const inMonth = isSameMonth(day, currentMonth);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const hasActivity = activityDates.has(key);
                  const _isToday = isToday(day);

                  return (
                    <button
                      key={key}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        relative flex items-center justify-center text-xs rounded-full transition-all duration-150
                        ${inMonth ? "h-8" : "h-8 text-slate-200"}
                        ${selected ? "bg-[#BF0F0F] text-white font-bold shadow-sm scale-105" : ""}
                        ${!selected && inMonth && _isToday ? "border-2 border-[#BF0F0F] text-[#BF0F0F] font-bold" : ""}
                        ${!selected && inMonth && !_isToday ? "hover:bg-slate-100 text-slate-800" : ""}
                        ${!inMonth ? "cursor-default" : "cursor-pointer"}
                      `}
                    >
                      {format(day, "d")}
                      {hasActivity && (
                        <span
                          className={`absolute bottom-1 w-1 h-1 rounded-full ${
                            selected ? "bg-white" : "bg-[#BF0F0F]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BF0F0F]" />
                  <span>Con actividades</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full border-2 border-[#BF0F0F] bg-transparent" />
                  <span>Hoy</span>
                </div>
              </div>

              {!selectedDate && hasActivitiesInMonth && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 text-center">
                    Haz clic en un d&iacute;a para ver actividades
                  </p>
                </div>
              )}

              {selectedDate && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-full text-center text-[10px] font-semibold text-[#BF0F0F] hover:underline"
                  >
                    Mostrar todas
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
