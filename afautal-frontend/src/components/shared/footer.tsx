import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import Logo from "./logo_negro";

const quickLinks = [
	{ label: "Inicio", href: "/" },
	{ label: "Quienes Somos", href: "/nosotros" },
	{ label: "Directiva", href: "/nosotros" },
	{ label: "Noticias", href: "/news" },
	{ label: "Contacto", href: "/contacto" },
];

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mt-16 text-white" style={{ backgroundColor: "lab(0 0 0 / 0.84)" }}>
			<div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					<section>
						<Link href="/" className="inline-flex items-center" aria-label="AFAUTAL Inicio">
							<Logo className="w-[160px] sm:w-[180px] lg:w-[210px]" />
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-white">
							Asociacion de Funcionarios Academicos de la Universidad de Talca. Trabajamos por el
							bienestar y desarrollo profesional de nuestros socios.
						</p>
					</section>

					<section>
						<h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Enlaces Rapidos</h3>
						<ul className="mt-4 space-y-2.5 text-sm">
							{quickLinks.map((link) => (
								<li key={link.href}>
									<Link href={link.href} className="text-white transition-colors hover:text-red-300">
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</section>

					<section>
						<h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Contacto</h3>
						<div className="mt-4 space-y-3 text-sm text-white">
							<p className="flex items-start gap-2.5">
								<MapPin className="mt-0.5 h-4 w-4 text-red-300" aria-hidden="true" />
								<span>Campus Talca, Universidad de Talca, Chile</span>
							</p>
							<a
								href="mailto:contacto@afautal.cl"
								className="inline-flex items-center gap-2.5 transition-colors hover:text-red-300"
							>
								<Mail className="h-4 w-4 text-red-300" aria-hidden="true" />
								<span>contacto@afautal.cl</span>
							</a>
						</div>
					</section>

					<section>
						<h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Siguenos</h3>
						<div className="mt-4 flex items-center gap-3">
							<a
								href="https://www.instagram.com/afautal/"
								target="_blank"
								rel="noreferrer"
								aria-label="Instagram AFAUTAL"
								className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-black-800 text-white visited:text-white transition-colors hover:border-red-300 hover:text-red-300"
							>
								<Instagram className="h-5 w-5" />
							</a>
						</div>
						<p className="mt-5 text-sm leading-relaxed text-white">
							Lunes a Viernes
							<br />
							09:00 - 13:00 | 14:00 - 18:00
						</p>
					</section>
				</div>

				<div className="mt-8 border-t border-slate-700 pt-5 text-sm text-white">
					<p>
						© {currentYear} AFAUTAL - Asociacion de Funcionarios Academicos Universidad de Talca.
						Todos los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}
