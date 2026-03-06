import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/tasks";
import BottomNav from "@/components/BottomNav";

const Activity = () => {
  const { user } = useAuth();
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchRecentTasks = async () => {
      try {
        const tasks = await taskService.getTasks({ completed: true });
        const sortedTasks = tasks
          .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
          .slice(0, 20);
        setRecentTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchRecentTasks();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Activity</h1>

        {recentTasks.length === 0 ? (
          <div className="mt-12 text-center">
            <Icon icon="mdi:check-circle-outline" className="mx-auto text-5xl text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No completed tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task: any) => {
              const categoryName = typeof task.category === 'object' ? task.category?.name : "General";
              return (
                <motion.div
                  key={task._id || task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-category-green/20">
                    <Icon icon="mdi:check" className="text-category-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryName} · 30 min
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default Activity;
