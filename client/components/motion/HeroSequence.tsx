import React from "react";

export function HeroSequence({
  title,
  className,
  as: Component = "h1",
  animate = true,
}: {
  title: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  animate?: boolean;
}) {
  const lines = title.split("\n");
  return (
    <Component className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden pb-[0.1em]">
          <span
            className="hero-sequence-line block"
            style={{
              "--hero-sequence-delay": `${index * 80}ms`,
              ...(animate ? {} : { animation: "none", opacity: 1, transform: "none" }),
            } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Component>
  );
}
