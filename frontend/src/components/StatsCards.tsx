import { Icon } from "@iconify/react";

interface StatsCardsProps {
  completionPercent: number;
  streak: number;
}

const StatsCards = ({ completionPercent, streak }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon icon="mdi:dots-hexagon" className="text-category-green text-lg" />
          <span className="text-xs font-medium uppercase tracking-wider">Status</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{completionPercent}%</p>
      </div>
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon icon="mdi:fire" className="text-category-orange text-lg" />
          <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{streak}</p>
      </div>
    </div>
  );
};

export default StatsCards;
