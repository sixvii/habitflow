import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Category {
  _id: string;
  id?: string;
  name: string;
  color: string;
  icon?: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    category_id: string;
    duration_minutes: number;
    is_priority: boolean;
    scheduled_date: string;
    card_color: string;
    recurrence: string | null;
  }) => void;
  categories: Category[];
  selectedDate: Date;
}

const CARD_COLORS = [
  { hex: "#DBEAFE", label: "Blue" },
  { hex: "#F3E8FF", label: "Purple" },
  { hex: "#FFEDD5", label: "Orange" },
  { hex: "#D1FAE5", label: "Green" },
  { hex: "#CCFBF1", label: "Teal" },
  { hex: "#FCE7F3", label: "Pink" },
  { hex: "#FEF3C7", label: "Yellow" },
  { hex: "#FEE2E2", label: "Red" },
];

const AddTaskModal = ({ isOpen, onClose, onAdd, categories, selectedDate }: AddTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [duration, setDuration] = useState(5);
  const [isPriority, setIsPriority] = useState(false);
  const [cardColor, setCardColor] = useState(CARD_COLORS[0].hex);
  const [recurrence, setRecurrence] = useState<string>("none");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      category_id: categoryId,
      duration_minutes: duration,
      is_priority: isPriority,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      card_color: cardColor,
      recurrence: recurrence === "none" ? null : recurrence,
    });
    setTitle("");
    setDuration(5);
    setIsPriority(false);
    setCardColor(CARD_COLORS[0].hex);
    setRecurrence("none");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-28 left-0 right-0 z-50 mx-auto max-w-md lg:max-w-4xl max-h-[90vh00vh] overflow-y-auto"
          >
            <div className="rounded-t-3xl bg-card border border-border p-6 pb-10 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Add New Task</h3>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
                  <Icon icon="mdi:close" className="text-xl text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Task Name</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          categoryId === cat.id
                            ? "ring-2 ring-primary shadow-md scale-105"
                            : "opacity-70"
                        }`}
                        style={{ backgroundColor: cat.color + "22", color: cat.color }}
                      >
                        <Icon icon={cat.icon} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Card Color</label>
                  <div className="flex flex-wrap gap-3">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setCardColor(c.hex)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          cardColor === c.hex
                            ? "border-primary scale-110 shadow-md"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-muted-foreground">Duration (min)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      max={480}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-muted-foreground">Priority</label>
                    <button
                      onClick={() => setIsPriority(!isPriority)}
                      className={`w-full rounded-xl border px-4 py-3 font-medium transition-colors ${
                        isPriority
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isPriority ? "🔥 Priority" : "Normal"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Repeat</label>
                  <div className="flex gap-2">
                    {[
                      { value: "none", label: "Once", icon: "mdi:numeric-1-circle" },
                      { value: "daily", label: "Daily", icon: "mdi:calendar-today" },
                      { value: "weekly", label: "Weekly", icon: "mdi:calendar-week" },
                      { value: "monthly", label: "Monthly", icon: "mdi:calendar-month" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setRecurrence(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                          recurrence === opt.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        <Icon icon={opt.icon} className="text-base" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
                >
                  Add Task
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
