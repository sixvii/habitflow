import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { taskService, Task } from "@/services/tasks";
import { categoryService, Category } from "@/services/categories";
import StatsCards from "@/components/StatsCards";
import DateSelector from "@/components/DateSelector";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import BottomNav from "@/components/BottomNav";
import { useNotificationReminders } from "@/hooks/useNotificationReminders";
import { getDailyQuote } from "@/lib/quotes";

const Index = () => {
  const { user } = useAuth();
  useNotificationReminders();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streak, setStreak] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [username, setUsername] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch tasks for the selected date
      const allTasks = await taskService.getTasks();
      const filteredTasks = allTasks.filter(task => 
        task.dueDate && format(new Date(task.dueDate), "yyyy-MM-dd") === dateStr
      );
      setTasks(filteredTasks);

      // Fetch categories
      const cats = await categoryService.getCategories();
      setCategories(cats);

      // Calculate streak from tasks
      const maxStreak = allTasks.reduce((max, task) => 
        Math.max(max, task.streak?.current || 0), 0
      );
      setStreak(maxStreak);

      // Set username from user
      setUsername(user.name || user.email?.split('@')[0] || "");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completionPercent = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.isCompleted).length / tasks.length) * 100)
    : 0;

  // Check for all tasks completed
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((t) => t.isCompleted)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleAddTask = async (task: any) => {
    if (!user) return;
    
    try {
      await taskService.createTask({
        title: task.title,
        description: task.notes || "",
        category: task.category_id || undefined,
        dueDate: task.scheduled_date,
        priority: task.is_priority ? "high" : "medium",
        isRecurring: task.recurrence && task.recurrence !== "none",
        recurrencePattern: task.recurrence === "none" ? undefined : task.recurrence,
      });

      // Handle recurrence - create future tasks
      if (task.recurrence && task.recurrence !== "none") {
        const baseDate = new Date(task.scheduled_date);
        const limit = task.recurrence === "daily" ? 30 : task.recurrence === "weekly" ? 12 : 6;
        
        for (let i = 1; i <= limit; i++) {
          let nextDate: Date;
          if (task.recurrence === "daily") nextDate = addDays(baseDate, i);
          else if (task.recurrence === "weekly") nextDate = addWeeks(baseDate, i);
          else nextDate = addMonths(baseDate, i);

          await taskService.createTask({
            title: task.title,
            description: task.notes || "",
            category: task.category_id || undefined,
            dueDate: format(nextDate, "yyyy-MM-dd"),
            priority: task.is_priority ? "high" : "medium",
            isRecurring: true,
            recurrencePattern: task.recurrence,
          });
        }
      }
      
      fetchData();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await taskService.toggleTaskCompletion(id);
      fetchData();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find((t) => t._id === id || t.id === id);
    if (task) {
      // Map task to include required fields for EditTaskModal
      const mappedTask = {
        ...task,
        duration_minutes: 30,
        is_priority: task.priority === "high",
        card_color: "#FFFFFF",
        recurrence: task.recurrencePattern || null,
        notes: task.description || null,
      };
      setEditingTask(mappedTask as any);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await taskService.updateTask(editingTask._id || editingTask.id!, {
        title: data.title,
        description: data.notes,
        category: data.category_id,
        dueDate: data.scheduled_date,
        priority: data.is_priority ? "high" : "medium",
      });
      setEditingTask(null);
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getCategoryForTask = (categoryId: string | null | undefined) => {
    if (!categoryId) return { name: "General", color: "#3B82F6", icon: "mdi:tag" };
    const category = categories.find((c) => c._id === categoryId || c.id === categoryId);
    return category ? {
      name: category.name,
      color: category.color,
      icon: category.icon || "mdi:tag"
    } : { name: "General", color: "#3B82F6", icon: "mdi:tag" };
  };

  // Map tasks to have priority info based on priority field
  const tasksWithPriority = tasks.map(task => ({
    ...task,
    is_priority: task.priority === "high",
    is_completed: task.isCompleted,
    category_id: typeof task.category === 'object' ? task.category?._id : task.category,
    scheduled_date: task.dueDate,
    duration_minutes: 30, // Default duration
    card_color: "#FFFFFF",
  }));

  const priorityTasks = tasksWithPriority.filter((t) => t.is_priority);
  const scheduledTasks = tasksWithPriority.filter((t) => !t.is_priority);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <ConfettiCelebration show={showConfetti} />

      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6 8">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {format(selectedDate, "EEEE, MMMM d")}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">
              {getGreeting()}, <span className="text-foreground">{username || "there"}!</span>
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = "/settings"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-gray-300 dark:border-gray-300 shadow-sm"
          >
            <Icon icon="mdi:cog" className="text-lg text-muted-foreground" />
          </motion.button>
        </div>

        {/* Daily Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4"
        >
          <div className="flex items-start gap-3">
            <Icon icon="mdi:format-quote-open" className="text-2xl text-muted-foreground/50 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground italic leading-relaxed">"{getDailyQuote().text}"</p>
              <p className="text-xs text-muted-foreground mt-1.5">— {getDailyQuote().author}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-5">
          <StatsCards completionPercent={completionPercent} streak={streak} />
        </div>

        {/* Date Selector */}
        <div className="mb-5">
          <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Today's Plan Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Today's Plan</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-gray-300 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
          >
            <Icon icon="mdi:plus-circle" className="text-base" />
            Add new task
          </motion.button>
        </div>

        {/* Priority Tasks */}
        {priorityTasks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</span>
            </div>
            <div className="relative ml-1 border-l-2 border-muted pl-5 space-y-3">
              <AnimatePresence>
                {priorityTasks.map((task) => {
                  const cat = getCategoryForTask(task.category_id);
                  const taskId = task._id || task.id || "";
                  return (
                    <motion.div
                      key={taskId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      layout
                    >
                      <TaskCard
                        id={taskId}
                        title={task.title}
                        categoryName={cat.name}
                        categoryColor={cat.color}
                        categoryIcon={cat.icon}
                        duration={task.duration_minutes}
                        isCompleted={task.is_completed}
                        cardColor={task.card_color}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Scheduled Tasks */}
        {scheduledTasks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled</span>
            </div>
            <div className="relative ml-1 border-l-2 border-muted pl-5 space-y-3">
              <AnimatePresence>
                {scheduledTasks.map((task) => {
                  const cat = getCategoryForTask(task.category_id);
                  const taskId = task._id || task.id || "";
                  return (
                    <motion.div
                      key={taskId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      layout
                    >
                      <TaskCard
                        id={taskId}
                        title={task.title}
                        categoryName={cat.name}
                        categoryColor={cat.color}
                        categoryIcon={cat.icon}
                        duration={task.duration_minutes}
                        isCompleted={task.is_completed}
                        cardColor={task.card_color}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="mt-12 text-center">
            <Icon icon="mdi:clipboard-check-outline" className="mx-auto text-5xl text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No tasks for this day</p>
            <p className="text-sm text-muted-foreground/70">Tap "Add new task" to get started</p>
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
        categories={categories}
        selectedDate={selectedDate}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
        task={editingTask}
      />

      <BottomNav />
    </motion.div>
  );
};

export default Index;
