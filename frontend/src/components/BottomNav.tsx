import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: "mdi:home", label: "Home" },
  { path: "/calendar", icon: "mdi:calendar-month", label: "Calendar" },
  { path: "/activity", icon: "mdi:broom", label: "Activity" },
  { path: "/analytics", icon: "mdi:chart-bar", label: "Analytics" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed -bottom-4 left-0 right-0 z-50">
      <div className="mx-auto max-w-md lg:max-w-4xl">
        <div className="mx-4 mb-4 flex items-center justify-around  bg-[#F5F5F5] dark:bg-black  p-2 ">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Icon icon={tab.icon} className="text-3xl" />
                {isActive && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
