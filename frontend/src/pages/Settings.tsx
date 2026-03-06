import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import CategoryManager from "@/components/CategoryManager";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(localStorage.getItem("habitflow_notifications") === "true");
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }
      localStorage.setItem("habitflow_notifications", "true");
      setNotificationsEnabled(true);
    } else {
      localStorage.setItem("habitflow_notifications", "false");
      setNotificationsEnabled(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const themeOptions: { value: "light" | "dark" | "system"; icon: string }[] = [
    { value: "light", icon: "mdi:weather-sunny" },
    { value: "dark", icon: "mdi:weather-night" },
    { value: "system", icon: "mdi:cellphone" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-28"
    >
      <div className="mx-auto max-w-md lg:max-w-4xl px-5 pt-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

        {/* Theme */}
        <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4 mb-4">
          <p className="text-base font-medium text-muted-foreground mb-3">Appearance</p>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-colors ${
                  theme === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon icon={opt.icon} className="text-xl" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Account */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/profile")}
          className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4 mb-4 cursor-pointer"
        >
          <p className="text-base font-medium text-muted-foreground mb-3">Account</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:account" className="text-xl text-muted-foreground" />
              <div>
                <p className="text-base font-medium text-foreground">{user?.email || "Not signed in"}</p>
                <p className="text-sm text-muted-foreground">Tap to edit profile</p>
              </div>
            </div>
            <Icon icon="mdi:chevron-right" className="text-xl text-muted-foreground" />
          </div>
        </motion.div>

        {/* Categories */}
        <CategoryManager />

        {/* Notifications */}
        <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4 mb-4">
          <p className="text-base font-medium text-muted-foreground mb-3">Notifications</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:bell-outline" className="text-xl text-muted-foreground" />
              <div>
                <p className="text-base font-medium text-foreground">Push Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified about pending tasks</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleNotifications}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                notificationsEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <motion.div
                animate={{ x: notificationsEnabled ? 20 : 2 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-primary-foreground shadow-sm"
              />
            </motion.button>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl bg-card border border-gray-300 dark:border-gray-300 p-4 mb-4">
          <p className="text-base font-medium text-muted-foreground mb-3">About</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-foreground">Version</span>
              <span className="text-base text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-foreground">App</span>
              <span className="text-base text-muted-foreground">HabitFlow</span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="w-full  py-3.5 font-semibold text-red-700"
        >
          Sign Out
        </motion.button>
      </div>
      <BottomNav />
    </motion.div>
  );
};

export default Settings;
