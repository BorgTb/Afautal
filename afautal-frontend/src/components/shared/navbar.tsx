"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, Clock3, Flame, HeartPulse, LogOut, Menu, User, X, ShieldCheck } from "lucide-react";
import Logo from "./logo";
import { useAuth } from "@/contexts/AuthContext";
import { fetchServiciosHabilitados } from "@/lib/servicios";

interface NavLink {
  name: string;
  href: string;
  icon?: React.ElementType;
}

const navLinks: NavLink[] = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Actividades", href: "/actividades" },
  { name: "Noticias", href: "/news" },
  { name: "Documentos", href: "/documentos" },
  { name: "Contacto", href: "/contacto" }
];

const unauthLinks: NavLink[] = [
  { name: "Área del asociado", href: "/auth/inicio-sesion", icon: User }
];

const staticAuthLinks: NavLink[] = [
  { name: "Panel del asociado", href: "/dashboard", icon: User },
  { name: "Comprar vales", href: "/dashboard/gestion-gas", icon: Flame },
];

const desktopActionClass =
  "flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-0";

const mobileActionClass =
  "flex justify-center items-center gap-2 rounded-xl bg-[#BF0F0F] py-4 text-white font-black";

const desktopLinkClass =
  "relative flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ease-in-out after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:bg-red-700 after:transition-all after:duration-200 hover:text-red-700 hover:after:w-full";

const mobileLinkClass =
  "flex items-center gap-3 px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl w-full text-left";

export default function Navbar() {
  const { isAuthenticated, isTemporaryPassword, loading, logout, token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const lastScrollY = useRef(0);
  
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);
  
  const [servicesLinks, setServicesLinks] = useState<NavLink[]>([]);

  const visibleLinks = navLinks.filter(
    (link) => link.name !== "Documentos" || isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchServiciosHabilitados(token)
        .then((servicios) => {
          const links = servicios.map((s) => ({
            name: s.nombre,
            href: `/dashboard/servicios/${s.slug}`,
          }));
          setServicesLinks(links);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (isServicesMenuOpen && !servicesMenuRef.current?.contains(event.target as Node)) {
        setIsServicesMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isServicesMenuOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b border-[#e5d9d6] bg-white transition-shadow duration-300 ${
        hasShadow ? "shadow-[0_4px_12px_rgba(18,52,91,0.08)]" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5">
        
        <div className="shrink-0">
          <Link href="/" className="flex items-center">
            <Logo priority />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-[18px] text-sm font-semibold">
          {visibleLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`${desktopLinkClass} text-slate-600 after:w-0`}>
              {link.name}
            </Link>
          ))}
          
          {!loading && !isAuthenticated && (
            <Link
              href="/auth/inicio-sesion"
              className="flex items-center gap-2 rounded-[10px] bg-[#BF0F0F] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#A50D0D]"
            >
              <User size={15} />
              Área del asociado
            </Link>
          )}
          
          {!loading && isAuthenticated && !isTemporaryPassword && (
            <>
              {staticAuthLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`${desktopLinkClass} text-slate-600 after:w-0`}>
                  {link.icon && <link.icon size={18} />}
                  {link.name}
                </Link>
              ))}

              {servicesLinks.length > 0 && (
                <div className="relative" ref={servicesMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsServicesMenuOpen((prev) => !prev)}
                    className={`${desktopLinkClass} ${
                      isServicesMenuOpen ? "text-red-700 after:w-full" : "text-slate-600 after:w-0"
                    }`}
                  >
                    <Briefcase size={18} />
                    Servicios
                    <ChevronDown size={14} className={`ml-0.5 transition-transform duration-200 ${isServicesMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div 
                    className={`absolute left-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-200 ease-out origin-top-left z-50 overflow-hidden ${
                      isServicesMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                    }`}
                  >
                    {servicesLinks.map((link, index) => (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-3.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsServicesMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                        {index < servicesLinks.length - 1 && <div className="h-px w-full bg-slate-100"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && isAuthenticated && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className={`${desktopLinkClass} ${
                  isUserMenuOpen ? "text-red-700 after:w-full" : "text-slate-600 after:w-0"
                }`}
                aria-label="Menu de usuario"
                aria-expanded={isUserMenuOpen}
              >
                <User size={20} />
              </button>
              
              <div 
                className={`absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-200 ease-out origin-top-right z-50 overflow-hidden ${
                  isUserMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                }`}
              >
                <Link
                  href="/dashboard/perfil"
                  className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User size={18} />
                  Mi perfil
                </Link>

                {user?.role?.type === 'admin' && (
                  <Link
                    href="/dashboard/admin/gas"
                    className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-red-700 hover:bg-red-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <ShieldCheck size={18} />
                    Admin Gas
                  </Link>
                )}

                <div className="h-px w-full bg-slate-200"></div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex lg:hidden shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Menú principal"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t p-4 space-y-4 shadow-2xl animate-in slide-in-from-top duration-300 relative z-50 overflow-y-auto max-h-[calc(100vh-80px)]">
          
          <div className="grid gap-1">
            {visibleLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={mobileLinkClass}>
                {link.name}
              </Link>
            ))}
          </div>
          
          <hr className="border-slate-100" />
          
          <div className="flex flex-col gap-3 pb-4">
            {!loading && !isAuthenticated && unauthLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={mobileActionClass}>
                {link.icon && <link.icon size={20} />} {link.name}
              </Link>
            ))}

            {!loading && isAuthenticated && !isTemporaryPassword && (
              <>
                {staticAuthLinks.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className={mobileLinkClass}>
                    {link.icon && <link.icon size={20} />} {link.name}
                  </Link>
                ))}

                {servicesLinks.length > 0 && (
                  <div className="py-2 border-y border-slate-100 my-2 bg-slate-50/50 rounded-xl">
                    <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Briefcase size={14} /> Servicios
                    </p>
                    <div className="grid gap-1">
                      {servicesLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={`${mobileLinkClass} pl-9 py-2.5 text-[15px] hover:bg-slate-100`}>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && isAuthenticated && (
              <>
                <Link href="/dashboard/perfil" onClick={() => setIsOpen(false)} className={mobileLinkClass}>
                  <User size={20} /> Mi perfil
                </Link>
                <button type="button" onClick={() => { logout(); setIsOpen(false); }} className={mobileLinkClass}>
                  <LogOut size={20} /> Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
