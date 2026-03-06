import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { categoryService, Category } from "@/services/categories";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#3B82F6", "#A855F7", "#F97316", "#10B981",
  "#EC4899", "#EAB308", "#EF4444", "#14B8A6",
  "#6366F1", "#8B5CF6", "#F43F5E", "#06B6D4",
];

const PRESET_ICONS = [
  "mdi:sofa", "mdi:silverware-fork-knife", "mdi:shower", "mdi:bed",
  "mdi:broom", "mdi:car", "mdi:dog", "mdi:flower",
  "mdi:dumbbell", "mdi:book-open-variant", "mdi:laptop", "mdi:heart",
  "mdi:music", "mdi:palette", "mdi:shopping", "mdi:tree",
];

const CategoryManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const resetForm = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    setIcon(PRESET_ICONS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, { name: name.trim(), color, icon });
        toast.success("Category updated!");
      } else {
        await categoryService.createCategory({ name: name.trim(), color, icon });
        toast.success("Category created!");
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(editingId ? "Failed to update" : "Failed to create");
    }
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon || PRESET_ICONS[0]);
    setEditingId(cat._id || cat.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">Categories</p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-sm font-medium text-primary"
        >
          {showForm ? "Cancel" : "+ Add"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-3 p-3 rounded-xl bg-muted">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-xl bg-card px-4 py-3 text-foreground outline-none border border-border focus:ring-2 focus:ring-primary"
              />

              <p className="text-xs font-medium text-muted-foreground">Color</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-muted" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <p className="text-xs font-medium text-muted-foreground">Icon</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${icon === i ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
                  >
                    <Icon icon={i} className="text-lg" />
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground"
              >
                {editingId ? "Update" : "Create"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            layout
            className="flex items-center justify-between rounded-xl bg-muted p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: cat.color + "22" }}
              >
                <Icon icon={cat.icon || "mdi:tag"} className="text-lg" style={{ color: cat.color }} />
              </div>
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(cat)} className="p-2 text-muted-foreground">
                <Icon icon="mdi:pencil" className="text-lg" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(cat.id)} className="p-2 text-destructive">
                <Icon icon="mdi:delete" className="text-lg" />
              </motion.button>
            </div>
          </motion.div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
