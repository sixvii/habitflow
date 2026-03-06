import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/tasks";
import { format, subDays, eachDayOfInterval } from "date-fns";

const HabitHeatmap = () => {
  const { user } = useAuth();
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 34); // 5 weeks

        const tasks = await taskService.getTasks({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        });

        if (!tasks) return;

        const dayMap: Record<string, { total: number; done: number }> = {};
        tasks.forEach((t: any) => {
          if (t.dueDate) {
            const dateStr = format(new Date(t.dueDate), "yyyy-MM-dd");
            if (!dayMap[dateStr]) dayMap[dateStr] = { total: 0, done: 0 };
            dayMap[dateStr].total++;
            if (t.isCompleted) dayMap[dateStr].done++;
          }
        });

        const result: Record<string, number> = {};
        Object.entries(dayMap).forEach(([date, { total, done }]) => {
          result[date] = total > 0 ? Math.round((done / total) * 100) : 0;
        });
        setHeatmapData(result);
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
      }
    };

    fetchData();
  }, [user]);

  const endDate = new Date();
  const startDate = subDays(endDate, 34);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getColor = (percent: number | undefined) => {
    if (percent === undefined) return "bg-muted";
    if (percent === 0) return "bg-muted";
    if (percent < 25) return "bg-red-300 dark:bg-red-800";
    if (percent < 50) return "bg-orange-300 dark:bg-orange-700";
    if (percent < 75) return "bg-yellow-300 dark:bg-yellow-700";
    if (percent < 100) return "bg-emerald-300 dark:bg-emerald-700";
    return "bg-emerald-500 dark:bg-emerald-500";
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 mb-6">
      <h2 className="text-base font-bold text-foreground mb-4">Habit Heatmap</h2>
      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground mb-1">
            {d}
          </div>
        ))}
        {/* Pad first row */}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const percent = heatmapData[dateStr];
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
          return (
            <div
              key={dateStr}
              title={`${format(day, "MMM d")}: ${percent !== undefined ? `${percent}%` : "No tasks"}`}
              className={`aspect-square rounded-md ${getColor(percent)} ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""} transition-colors`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-orange-300 dark:bg-orange-700" />
        <div className="h-3 w-3 rounded-sm bg-yellow-300 dark:bg-yellow-700" />
        <div className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
        <div className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
};

export default HabitHeatmap;
