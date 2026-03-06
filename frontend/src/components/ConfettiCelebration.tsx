import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = ["#3B82F6", "#A855F7", "#F97316", "#10B981", "#EC4899", "#EAB308", "#EF4444", "#14B8A6"];

const ConfettiCelebration = ({ show }: { show: boolean }) => {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
      }));
      setPieces(newPieces);
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
              animate={{ y: "100vh", opacity: 0, rotate: 720 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeOut" }}
              className="absolute rounded-sm"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                left: `${p.x}%`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
