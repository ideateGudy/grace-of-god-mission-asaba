import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className,
  imageClassName,
  textClassName,
  showText = true,
  size = "md",
}: LogoProps) {
  const sizeMap = {
    sm: { img: 28, class: "h-7 w-7", title: "text-base", sub: "text-[9px]" },
    md: { img: 36, class: "h-9 w-9", title: "text-lg md:text-xl", sub: "text-[10px]" },
    lg: { img: 52, class: "h-13 w-13", title: "text-2xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/ggm_logo.png"
          alt="Grace of God Mission Logo"
          width={currentSize.img}
          height={currentSize.img}
          className={cn("object-contain rounded-full", currentSize.class, imageClassName)}
          priority
        />
      </div>
      {showText && (
        <div className={cn("flex flex-col leading-tight text-inherit", textClassName)}>
          <span className={cn("font-display font-bold tracking-tight text-inherit", currentSize.title)}>
            Grace of God
          </span>
          <span className={cn("font-semibold tracking-wider uppercase opacity-75 text-inherit", currentSize.sub)}>
            Mission Asaba
          </span>
        </div>
      )}
    </div>
  );
}
