import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    duration_minutes: number;
    is_priority: boolean;
    card_color: string;
    recurrence: string | null;
    notes: string | null;
  }) => void;
  task: {
    title: string;
    duration_minutes: number;
    is_priority: boolean;
    card_color: string;
    recurrence?: string | null;
    notes?: string | null;
  } | null;
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

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Once", icon: "mdi:numeric-1-circle" },
  { value: "daily", label: "Daily", icon: "mdi:calendar-today" },
  { value: "weekly", label: "Weekly", icon: "mdi:calendar-week" },
  { value: "monthly", label: "Monthly", icon: "mdi:calendar-month" },
];

const EditTaskModal = ({ isOpen, onClose, onSave, task }: EditTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);
  const [isPriority, setIsPriority] = useState(false);
  const [cardColor, setCardColor] = useState(CARD_COLORS[0].hex);
  const [recurrence, setRecurrence] = useState("none");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDuration(task.duration_minutes || 5);
      setIsPriority(task.is_priority || false);
      setCardColor(task.card_color || CARD_COLORS[0].hex);
      setRecurrence(task.recurrence || "none");
      setNotes(task.notes || "");
    }
  }, [task]);

  if (!task) return null;

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
            className="fixed bottom-28 left-0 right-0 z-50 mx-auto max-w-md lg:max-w-4xl max-h-[85vh] overflow-y-auto"
          >
            <div className="rounded-t-3xl bg-card border border-border p-6 pb-10 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Edit Task</h3>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
                  <Icon icon="mdi:close" className="text-xl text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={100}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Card Color</label>
                  <div className="flex flex-wrap gap-3">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setCardColor(c.hex)}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${
                          cardColor === c.hex ? "border-primary scale-110 shadow-md" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-muted-foreground">Duration</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-muted-foreground">Priority</label>
                    <button
                      onClick={() => setIsPriority(!isPriority)}
                      className={`w-full rounded-xl border px-4 py-3 font-medium transition-colors ${
                        isPriority ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isPriority ? "🔥 Priority" : "Normal"}
                    </button>
                  </div>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Repeat</label>
                  <div className="flex gap-2">
                    {RECURRENCE_OPTIONS.map((opt) => (
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

                {/* Notes / Subtasks */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">Notes / Subtasks</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes or subtasks (one per line)..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    onSave({
                      title,
                      duration_minutes: duration,
                      is_priority: isPriority,
                      card_color: cardColor,
                      recurrence: recurrence === "none" ? null : recurrence,
                      notes: notes.trim() || null,
                    })
                  }
                  className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground"
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
