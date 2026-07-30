import Image from "next/image";

interface LogoProps {
    className?: string;
    priority?: boolean;
}

export default function Logo({ className = "", priority = false }: LogoProps) {
    return (
        <Image
            src="/AFAUTAL.svg"
            alt="Afautal Logo"
            width={130}
            height={44}
            priority={priority}
            className={`h-auto w-[110px] sm:w-[130px] ${className}`}
        />
    );
}