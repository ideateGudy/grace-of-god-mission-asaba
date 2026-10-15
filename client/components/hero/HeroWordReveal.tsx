import { HeroSequence } from "@/components/motion/HeroSequence";

export function HeroWordReveal({ text, className }: { text: string; className?: string }) {
  return <HeroSequence title={text} className={className} />;
}
