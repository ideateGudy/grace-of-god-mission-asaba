import React from "react";

export function HeroSequence({
  title,
  className,
  as: Component = "h1",
}: {
  title: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  const lines = title.split("\n");
  return (
    <Component className={className}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden pb-[0.1em]">
          <span
            className="hero-sequence-line block"
            style={{ "--hero-sequence-delay": `${index * 80}ms` } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Component>
  );
}
