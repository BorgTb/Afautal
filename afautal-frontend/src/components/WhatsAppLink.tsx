"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSingleType } from "@/lib/strapi";

interface WhatsAppLinkProps {
  className?: string;
  target?: "blank" | "self";
}

export function WhatsAppLink({ className, target = "blank" }: WhatsAppLinkProps) {
  const { isAuthenticated } = useAuth();
  const [whatsappLink, setWhatsAppLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWhatsAppLink() {
      try {
        const result = await getSingleType<{ link: string }>("whatsapp-link", "populate=*");
        setWhatsAppLink(result.data?.link ?? null);
      } catch (error) {
        console.error("Error fetching WhatsApp link:", error);
        setWhatsAppLink(null);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchWhatsAppLink();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || loading) {
    return null;
  }

  if (!whatsappLink) {
    return (
      <p className="text-sm text-slate-500">No configurado</p>
    );
  }

  const targetAttr = target === "blank" ? "_blank" : "_self";
  const ariaLabel = "Grupos de WhatsApp";

  return (
    <a
      href={whatsappLink}
      className={`inline-flex items-center gap-2 rounded-lg border border-[#BF0F0F] text-[#BF0F0F] font-medium text-sm hover:bg-[#A61B26] hover:text-white transition-colors duration-300 ${className || ""}`}
      target={targetAttr}
      rel={target === "blank" ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.5 16.5c0 .65-.13 1.26-.36 1.82l1.25 1.25A8.5 8.5 0 0 1 12 20.5S3.5 18 3.5 15c0-2.7 2-4.5 4.5-4.5S9 10.3 9 7.5a5.46 5.46 0 0 1 2 2.27l1.68 1.68C15.94 7.13 16.5 8.36 16.5 9.5zM12 4.5C6.6 4.5 2 8.1 2 12s4.6 7.5 10 7.5 10-4.5 10-7.5S17.4 4.5 12 4.5z" />
        <path d="M2.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3.5 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0-5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      </svg>
      WhatsApp
    </a>
  );
}