"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  return <motion.span aria-hidden="true" style={{ opacity }} className="mr-[0.25em] inline-block">{word}</motion.span>;
}

export function WordReveal({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = text.trim().split(/\s+/);
  if (reduce) return <p className="font-display text-[length:var(--fs-h2)] leading-tight">{text}</p>;
  return <div ref={ref} className="relative h-[180svh]"><div className="sticky top-0 flex h-[100svh] items-center"><p aria-label={text} className="mx-auto max-w-3xl px-5 font-display text-[length:var(--fs-h2)] leading-tight text-balance">{words.map((word, index) => { const start = index / words.length; return <Word key={`${word}-${index}`} word={word} range={[start * 0.9, Math.min(1, start * 0.9 + 0.12)]} progress={scrollYProgress} />; })}</p></div></div>;
}
