import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from "date-fns";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/tasks";
import BottomNav from "@/components/BottomNav";

const Calendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [taskDates, setTaskDates] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayTasks, setDayTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const fetchTasks = async () => {
      try {
        const tasks = await taskService.getTasks({ startDate: start, endDate: end });
        const counts: Record<string, number> = {};
        tasks.forEach((t: any) => {
          if (t.dueDate) {
            const dateStr = format(new Date(t.dueDate), "yyyy-MM-dd");
            counts[dateStr] = (counts[dateStr] || 0) + 1;
          }
        });
        setTaskDates(counts);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [user, currentMonth]);

  useEffect(() => {
    if (!user || !selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const fetchDayTasks = async () => {
      try {
        const tasks = await taskService.getTasks();
        const filtered = tasks.filter(t => 
          t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr
        );
        setDayTasks(filtered);
      } catch (error) {
        console.error("Error fetching day tasks:", error);
      }
    };
    fetchDayTasks();
  }, [user, selectedDate]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDayOfWeek = getDay(startOfMonth(currentMonth));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-muted">
            <Icon icon="mdi:chevron-left" className="text-xl text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</h1>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-muted">
            <Icon icon="mdi:chevron-right" className="text-xl text-foreground" />
          </button>
        </div>

        {/* Calendar wrapper with border */}
        <div className="rounded-2xl border border-gray-300 dark:border-gray-300 p-4">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const count = taskDates[dateStr] || 0;
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "bg-accent text-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm">{format(day, "d")}</span>
                {count > 0 && (
                  <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-category-blue"}`} />
                )}
              </button>
            );
          })}
        </div>
        </div>

        {/* Selected day tasks */}
        {selectedDate && (
          <div className="mt-6">
            <h2 className="text-base font-bold text-foreground mb-3">
              {format(selectedDate, "EEEE, MMM d")}
            </h2>
            {dayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks scheduled</p>
            ) : (
              <div className="space-y-2">
                {dayTasks.map((task: any) => (
                  <div key={task._id || task.id} className="flex items-center gap-3 rounded-xl bg-card border border-gray-300 dark:border-gray-300 p-3">
                    <div className={`h-3 w-3 rounded-full ${task.is_completed ? "bg-category-green" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1">
                      <p className={`font-medium text-foreground ${task.is_completed ? "line-through opacity-60" : ""}`}>{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.duration_minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default Calendar;
