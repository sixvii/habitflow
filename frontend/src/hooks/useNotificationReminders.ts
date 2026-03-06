import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/tasks";
import { format } from "date-fns";

const requestPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

const sendNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
};

export const useNotificationReminders = () => {
  const { user } = useAuth();

  const checkAndNotify = useCallback(async () => {
    if (!user) return;
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const tasks = await taskService.getTasks();
      const todayTasks = tasks.filter(t => 
        t.dueDate && format(new Date(t.dueDate), "yyyy-MM-dd") === today
      );

      if (!todayTasks || todayTasks.length === 0) return;

      const pending = todayTasks.filter((t: any) => !t.isCompleted);
      if (pending.length > 0) {
        sendNotification(
          "HabitFlow Reminder",
          `You have ${pending.length} task${pending.length > 1 ? "s" : ""} remaining today!`
        );
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const enabled = localStorage.getItem("habitflow_notifications") === "true";
    if (!enabled) return;

    requestPermission();

    // Check every 30 minutes
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000);

    // Daily summary at load
    const timeout = setTimeout(checkAndNotify, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, checkAndNotify]);
};

export default useNotificationReminders;
