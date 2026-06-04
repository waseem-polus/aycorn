import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transition } from "@/features/calendar/animations";
import { stageBulletClass } from "@/features/stage/stage-palette";
import type { TEventColor } from "@/features/calendar/types";

export function EventBullet({
  color,
  className,
}: {
  color: TEventColor;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("size-2 rounded-full", stageBulletClass(color), className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2 }}
      transition={transition}
    />
  );
}
