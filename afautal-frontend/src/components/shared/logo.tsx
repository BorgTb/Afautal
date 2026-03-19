import Image from "next/image";

interface LogoProps {
    className?: string;
    priority?: boolean;
}

export default function Logo({ className = "", priority = false }: LogoProps) {
    return (
        <Image
            src="/Logo Afautal.svg"
            alt="Afautal Logo"
            width={220}
            height={74}
            priority={priority}
            className={`h-auto w-[150px] sm:w-[170px] lg:w-[300px] ${className}`}
        />
    );
}