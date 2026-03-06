import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface TaskCardProps {
  id: string;
  title: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  duration: number;
  isCompleted: boolean;
  cardColor: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const colorToPasstel: Record<string, string> = {
  "#DBEAFE": "bg-card-pastel-blue",
  "#F3E8FF": "bg-card-pastel-purple",
  "#FFEDD5": "bg-card-pastel-orange",
  "#D1FAE5": "bg-card-pastel-green",
  "#CCFBF1": "bg-card-pastel-teal",
  "#FCE7F3": "bg-card-pastel-pink",
  "#FEF3C7": "bg-card-pastel-yellow",
  "#FEE2E2": "bg-card-pastel-red",
};

const categoryColorMap: Record<string, string> = {
  "#3B82F6": "bg-category-blue",
  "#A855F7": "bg-category-purple",
  "#F97316": "bg-category-orange",
  "#10B981": "bg-category-green",
  "#14B8A6": "bg-category-teal",
  "#EC4899": "bg-category-pink",
  "#EAB308": "bg-category-yellow",
  "#EF4444": "bg-category-red",
};

const TaskCard = ({
  id,
  title,
  categoryName,
  categoryColor,
  categoryIcon,
  duration,
  isCompleted,
  cardColor,
  onToggle,
  onDelete,
  onEdit,
}: TaskCardProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);

  const bgClass = colorToPasstel[cardColor] || "bg-card-pastel-blue";
  const catBgClass = categoryColorMap[categoryColor] || "bg-category-blue";

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(id);
    }
  };

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      onEdit(id);
    }, 600);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end rounded-2xl bg-destructive px-6"
      >
        <Icon icon="mdi:delete" className="text-2xl text-destructive-foreground" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 rounded-2xl ${bgClass} border border-border/50 p-4 shadow-sm transition-all ${
          isCompleted ? "opacity-60" : ""
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? "border-primary bg-primary"
              : "border-muted-foreground/40 bg-transparent"
          }`}
        >
          {isCompleted && (
            <Icon icon="mdi:check" className="text-sm text-primary-foreground" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-foreground ${isCompleted ? "line-through" : ""}`}>
            {title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 rounded-full ${catBgClass} px-2.5 py-0.5 text-[0.7rem] font-semibold text-primary-foreground uppercase tracking-wide`}>
              <Icon icon={categoryIcon} className="text-xs" />
              {categoryName}
            </span>
            <span className="text-sm text-muted-foreground">{duration} min</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskCard;
