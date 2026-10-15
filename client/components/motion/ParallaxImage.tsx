"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return <div ref={ref} className="relative aspect-[4/5] overflow-hidden rounded-xl md:aspect-[16/10]"><motion.div style={reduce ? undefined : { y, scale: 1.18 }} className="absolute inset-0"><Image src={src} alt={alt} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" /></motion.div></div>;
}
