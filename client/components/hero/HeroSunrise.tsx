"use client";

import { motion } from "motion/react";

export function HeroSunrise() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 0.6, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-3xl rounded-full mix-blend-screen dark:mix-blend-lighten"
        style={{
          background: "radial-gradient(ellipse at bottom, var(--color-gold) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}
