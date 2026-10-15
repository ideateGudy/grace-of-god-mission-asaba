"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function SunriseBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const dawn = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const day = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);
  const lightY = useTransform(scrollYProgress, [0, 0.5], ["20%", "-10%"]);
  const lightO = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.7], [0, 0.75, 0.45, 0]);
  if (reduce) return <div aria-hidden="true" className="fixed inset-0 -z-10 bg-background" />;
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-background"><motion.div style={{ opacity: day }} className="absolute inset-0 bg-linear-to-b from-sky to-background dark:from-secondary dark:to-background" /><motion.div style={{ opacity: dawn }} className="absolute inset-0 bg-linear-to-b from-midnight via-indigo to-sky dark:from-night dark:via-midnight dark:to-secondary" /><motion.div style={{ y: lightY, opacity: lightO, background: "radial-gradient(closest-side, color-mix(in srgb, var(--gold) 45%, transparent), transparent)" }} className="absolute left-1/2 top-[55%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full" /></div>;
}
