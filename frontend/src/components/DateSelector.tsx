import { useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const DateSelector = ({ selectedDate, onDateSelect }: DateSelectorProps) => {
  const dates = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        return (
          <motion.button
            key={date.toISOString()}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDateSelect(date)}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[3.2rem] transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground"
            }`}
          >
            <span className="text-[0.65rem] font-medium uppercase">
              {format(date, "EEE")}
            </span>
            <span className="text-base font-semibold">{format(date, "d")}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DateSelector;
