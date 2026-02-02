import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TechCategory {
  id: string;
  name: string;
  sort_order: number;
}

interface TechItem {
  id: string;
  name: string;
  category_id: string | null;
  icon_name: string | null;
  proficiency: number;
  is_featured: boolean;
  sort_order: number;
}

const emptyItem: Partial<TechItem> = {
  name: "",
  category_id: null,
  icon_name: "",
  proficiency: 80,
  is_featured: false,
  sort_order: 0,
};

export default function TechStackAdmin() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TechItem> | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["admin-tech-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as TechCategory[];
    },
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-tech-stack"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_stack")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as TechItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: Partial<TechItem>) => {
      const { error } = await supabase.from("tech_stack").insert([item as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tech-stack"] });
      queryClient.invalidateQueries({ queryKey: ["tech-stack"] });
      toast.success("Tech added!");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (item: Partial<TechItem>) => {
      const { error } = await supabase
        .from("tech_stack")
        .update(item)
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tech-stack"] });
      queryClient.invalidateQueries({ queryKey: ["tech-stack"] });
      toast.success("Tech updated!");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tech_stack").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tech-stack"] });
      queryClient.invalidateQueries({ queryKey: ["tech-stack"] });
      toast.success("Tech deleted!");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleOpenDialog = (item?: TechItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem(emptyItem);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name) {
      toast.error("Please enter a name");
      return;
    }

    if (editingItem.id) {
      updateMutation.mutate(editingItem);
    } else {
      createMutation.mutate(editingItem);
    }
  };

  // Group items by category
  const itemsByCategory = categories?.map((category) => ({
    ...category,
    items: items?.filter((item) => item.category_id === category.id) || [],
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Tech Stack
          </h1>
          <p className="text-foreground-secondary">
            Manage your skills and technologies.
          </p>
        </div>
        <Button variant="hero" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          Add Tech
        </Button>
      </motion.div>

      {/* Categories with Items */}
      {itemsByCategory?.map((category, catIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-display text-xl font-semibold text-foreground">
            {category.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="card-elevated p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.icon_name === "java"
                      ? "☕"
                      : item.icon_name === "javascript"
                      ? "🟨"
                      : item.icon_name === "typescript"
                      ? "💙"
                      : item.icon_name === "react"
                      ? "⚛️"
                      : "🔧"}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.proficiency}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground-muted">
                        {item.proficiency}%
                      </span>
                    </div>
                  </div>
                  {item.is_featured && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this tech?")) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-foreground-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingItem?.id ? "Edit Tech" : "Add Tech"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name
              </label>
              <Input
                value={editingItem?.name || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="React"
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Select
                value={editingItem?.category_id || ""}
                onValueChange={(value) =>
                  setEditingItem((prev) => ({ ...prev, category_id: value }))
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Icon Name
              </label>
              <Input
                value={editingItem?.icon_name || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, icon_name: e.target.value }))
                }
                placeholder="react, javascript, etc."
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Proficiency ({editingItem?.proficiency || 80}%)
              </label>
              <Input
                type="range"
                min="0"
                max="100"
                value={editingItem?.proficiency || 80}
                onChange={(e) =>
                  setEditingItem((prev) => ({
                    ...prev,
                    proficiency: parseInt(e.target.value),
                  }))
                }
                className="bg-background"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editingItem?.is_featured || false}
                onCheckedChange={(checked) =>
                  setEditingItem((prev) => ({ ...prev, is_featured: checked }))
                }
              />
              <label className="text-sm text-foreground">Featured</label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingItem?.id ? (
                  "Save"
                ) : (
                  "Add Tech"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
