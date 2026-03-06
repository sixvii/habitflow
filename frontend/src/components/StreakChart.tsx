import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/analytics";
import { taskService } from "@/services/tasks";
import { format, subDays, eachDayOfInterval } from "date-fns";

const StreakChart = () => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weekStreaks, setWeekStreaks] = useState<{ day: string; hit: boolean }[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStreaks = async () => {
      try {
        // Get streak data from analytics
        const streaks = await analyticsService.getStreakStats();
        if (streaks.length > 0) {
          const maxCurrent = Math.max(...streaks.map(s => s.currentStreak));
          const maxLongest = Math.max(...streaks.map(s => s.longestStreak));
          setCurrentStreak(maxCurrent);
          setLongestStreak(maxLongest);
        }

        // Get last 14 days of task data for streak calendar
        const endDate = new Date();
        const startDate = subDays(endDate, 13);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const tasks = await taskService.getTasks({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        });

        const dayMap: Record<string, { total: number; done: number }> = {};
        tasks?.forEach((t: any) => {
          if (t.dueDate) {
            const dateStr = format(new Date(t.dueDate), "yyyy-MM-dd");
            if (!dayMap[dateStr]) dayMap[dateStr] = { total: 0, done: 0 };
            dayMap[dateStr].total++;
            if (t.isCompleted) dayMap[dateStr].done++;
          }
        });

        setWeekStreaks(
          days.map((d) => {
            const dateStr = format(d, "yyyy-MM-dd");
            const info = dayMap[dateStr];
            const hit = info ? info.done / info.total >= 0.8 : false;
            return { day: format(d, "dd"), hit };
          })
        );
      } catch (error) {
        console.error("Error fetching streaks:", error);
      }
    };

    fetchStreaks();
  }, [user]);

  return (
    <div className="rounded-2xl bg-card border border-border p-4 mb-6">
      <h2 className="text-base font-bold text-foreground mb-4">Streak Overview</h2>

      {/* Current / Longest */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl bg-muted p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Icon icon="mdi:fire" className="text-lg" style={{ color: "hsl(var(--streak-orange))" }} />
            <span className="text-xs font-medium text-muted-foreground">Current</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>
        <div className="rounded-xl bg-muted p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Icon icon="mdi:trophy" className="text-lg" style={{ color: "hsl(var(--category-yellow))" }} />
            <span className="text-xs font-medium text-muted-foreground">Longest</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground">days</p>
        </div>
      </div>

      {/* 14-day streak calendar */}
      <p className="text-xs font-medium text-muted-foreground mb-2">Last 14 days</p>
      <div className="flex gap-1.5">
        {weekStreaks.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`h-8 w-full rounded-lg flex items-center justify-center ${
                d.hit ? "bg-primary" : "bg-muted"
              }`}
            >
              {d.hit && (
                <Icon icon="mdi:check" className="text-sm text-primary-foreground" />
              )}
            </motion.div>
            <span className="text-[9px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakChart;
