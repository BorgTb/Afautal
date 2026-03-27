"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, User, UserPlus, Flame } from "lucide-react";
import Logo from "./logo";

// Tipado para los links
interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Noticias", href: "/news" },
  { name: "Documentos", href: "/documentos" },
  { name: "Contacto", href: "/contacto" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasShadow, setHasShadow] = useState(false);
  const [lineExpanded, setLineExpanded] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;
      setHasShadow(currentScrollY > 8);

      if (isOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 8) {
        setIsVisible(true);
      } else if (scrollDelta > 6) {
        setIsVisible(false);
      } else if (scrollDelta < -6) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };
    //border-b backdrop-blur-xl shadow-sm
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLineExpanded(true);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (

    <nav
      className={`sticky top-0 z-50 w-full  border-slate-200 bg-white/95  transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${hasShadow ? "shadow-[0_8px_24px_rgba(15,23,42,0.12)]" : "shadow-none"}`}
    >
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-0">
        <div className="flex h-[200px] items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo AFAUTAL */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Logo priority />
            </Link>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden xl:flex flex-1 justify-center">
            <div className="flex items-center gap-20">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-[15px] font-semibold text-slate-600 transition-colors duration-200 ease-in-out after:absolute after:bottom-[-8px] after:left-0 after:h-[2px] after:w-0 after:bg-red-700 after:transition-all after:duration-200 hover:text-red-700 hover:after:w-full"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Botones de Acción (Visibles para todos) */}
          <div className="hidden lg:flex shrink-0 items-center gap-3 xl:gap-4">
            {/*
            <Link 
              href="/vales-gas" 
              className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:shadow-md"
            >
              <Flame size={16} />
              Vales de Gas
            </Link>
            */}
            
            <Link 
              href="/auth/registro" 
              className="flex items-center gap-2 rounded-full bg-[#BF0F0F] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[#A50D0D] hover:shadow-md active:translate-y-0"
            >
              <UserPlus size={16} />
              Hazte Socio
            </Link>

            <div className="h-8 w-px bg-slate-200" />

            <Link 
              href="/auth/inicio-sesion" 
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-0"
            >
              <User size={16} />
              Portal
            </Link>
          </div>

          {/* Menú Móvil Botón */}
          <div className="flex lg:hidden shrink-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Menú principal"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Móvil */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t p-4 space-y-4 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <hr />
          <div className="flex flex-col gap-3 pb-4">
            <Link href="/vales-gas" className="flex justify-center items-center gap-2 rounded-xl bg-orange-500 py-4 text-white font-black">
              <Flame size={20} /> Comprar Gas
            </Link>
            <Link href="/auth/register" className="flex justify-center items-center gap-2 rounded-xl bg-emerald-600 py-4 text-white font-black">
              <UserPlus size={20} /> Ser Socio
            </Link>
            <Link href="/auth/login" className="flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-4 text-white font-black">
              <User size={20} /> Entrar al Portal
            </Link>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <span
          aria-hidden="true"
          className="bg-slate-300/80 shadow-[0_0_8px_rgba(148,163,184,0.3)] transition-all duration-700 ease-out"
          style={{
            width: lineExpanded ? "100%" : "10px",
            height: lineExpanded ? "1px" : "10px",
            borderRadius: "9999px",
          }}
        />
      </div>
    </nav>
  );
}