import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/tasks";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import BottomNav from "@/components/BottomNav";
import HabitHeatmap from "@/components/HabitHeatmap";
import StreakChart from "@/components/StreakChart";

const COLORS = ["#3B82F6", "#A855F7", "#F97316", "#10B981", "#EC4899", "#EAB308"];

const Analytics = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<{ day: string; percent: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        // Weekly data
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const weekTasks = await taskService.getTasks({
          startDate: format(weekStart, "yyyy-MM-dd"),
          endDate: format(weekEnd, "yyyy-MM-dd"),
        });

        const weekly = weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayTasks = weekTasks.filter((t: any) => 
            t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr
          );
          const completed = dayTasks.filter((t: any) => t.isCompleted).length;
          return {
            day: format(day, "EEE"),
            percent: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0,
          };
        });
        setWeeklyData(weekly);

        // All-time stats
        const allTasks = await taskService.getTasks();

        if (allTasks) {
          setTotalTasks(allTasks.length);
          setTotalCompleted(allTasks.filter((t: any) => t.isCompleted).length);

          // Category breakdown
          const catMap: Record<string, { count: number; color: string }> = {};
          allTasks.forEach((t: any) => {
            const cat = typeof t.category === 'object' ? t.category : null;
            const name = cat?.name || "Uncategorized";
            const color = cat?.color || "#6B7280";
            if (!catMap[name]) catMap[name] = { count: 0, color };
            catMap[name].count++;
          });
          setCategoryData(Object.entries(catMap).map(([name, { count, color }]) => ({ name, value: count, color })));
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Total Tasks</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalTasks}</p>
          </div>
          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Completed</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCompleted}</p>
          </div>
        </div>

        {/* Streak Overview */}
        <StreakChart />

        {/* Habit Heatmap */}
        <HabitHeatmap />

        {/* Weekly Chart */}
        <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4 mb-6">
          <h2 className="text-base font-bold text-foreground mb-4">Weekly Completion</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="percent" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4">
            <h2 className="text-base font-bold text-foreground mb-4">By Category</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default Analytics;
