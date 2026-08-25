import type { RedSocialData } from "@/lib/redes-sociales";
import { resolveIcon } from "@/lib/redes-sociales";

interface SocialLinksProps {
	redes: RedSocialData[];
	variant?: "light" | "dark";
	className?: string;
}

const variantStyles = {
	light: "border-gray-300 text-gray-700 hover:border-[#BF0F0F] hover:text-[#BF0F0F]",
	dark: "border-white text-white hover:border-red-300 hover:text-red-300",
} as const;

export default function SocialLinks({
	redes,
	variant = "light",
	className = "",
}: SocialLinksProps) {
	if (!redes.length) return null;

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			{redes.map(({ nombre, label, url, iconKey }) => {
				const Icon = resolveIcon(iconKey);
				return (
					<a
						key={nombre}
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={label}
						title={label}
						className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${variantStyles[variant]}`}
					>
						<Icon className="h-5 w-5" aria-hidden="true" />
					</a>
				);
			})}
		</div>
	);
}
