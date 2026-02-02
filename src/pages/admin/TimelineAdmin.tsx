import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface TimelineItem {
  id: string;
  type: string;
  title: string;
  organization: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  sort_order: number;
}

const emptyItem: Partial<TimelineItem> = {
  type: "experience",
  title: "",
  organization: "",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  sort_order: 0,
};

export default function TimelineAdmin() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TimelineItem> | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as TimelineItem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: Partial<TimelineItem>) => {
      const { error } = await supabase.from("timeline").insert([item as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      toast.success("Timeline item added!");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (item: Partial<TimelineItem>) => {
      const { error } = await supabase
        .from("timeline")
        .update(item)
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      toast.success("Timeline item updated!");
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("timeline").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      toast.success("Timeline item deleted!");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleOpenDialog = (item?: TimelineItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem(emptyItem);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.organization || !editingItem?.start_date) {
      toast.error("Please fill in required fields");
      return;
    }

    const itemData = {
      ...editingItem,
      end_date: editingItem.is_current ? null : editingItem.end_date || null,
    };

    if (editingItem.id) {
      updateMutation.mutate(itemData);
    } else {
      createMutation.mutate(itemData);
    }
  };

  const experienceItems = items?.filter((i) => i.type === "experience") || [];
  const educationItems = items?.filter((i) => i.type === "education") || [];

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
            Timeline
          </h1>
          <p className="text-foreground-secondary">
            Manage your experience and education.
          </p>
        </div>
        <Button variant="hero" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </motion.div>

      {/* Experience Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Experience
          </h2>
        </div>
        <div className="space-y-4">
          {experienceItems.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              onEdit={() => handleOpenDialog(item)}
              onDelete={() => {
                if (confirm("Delete this entry?")) {
                  deleteMutation.mutate(item.id);
                }
              }}
            />
          ))}
          {experienceItems.length === 0 && (
            <p className="text-foreground-muted text-sm">No experience entries yet.</p>
          )}
        </div>
      </motion.div>

      {/* Education Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Education
          </h2>
        </div>
        <div className="space-y-4">
          {educationItems.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              onEdit={() => handleOpenDialog(item)}
              onDelete={() => {
                if (confirm("Delete this entry?")) {
                  deleteMutation.mutate(item.id);
                }
              }}
            />
          ))}
          {educationItems.length === 0 && (
            <p className="text-foreground-muted text-sm">No education entries yet.</p>
          )}
        </div>
      </motion.div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingItem?.id ? "Edit Entry" : "Add Entry"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <Select
                value={editingItem?.type || "experience"}
                onValueChange={(value) =>
                  setEditingItem((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                value={editingItem?.title || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Software Developer"
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Organization *
              </label>
              <Input
                value={editingItem?.organization || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, organization: e.target.value }))
                }
                placeholder="Company Name"
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <Input
                value={editingItem?.location || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="City, Country"
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={editingItem?.start_date || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={editingItem?.end_date || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                  className="bg-background border-border"
                  disabled={editingItem?.is_current}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editingItem?.is_current || false}
                onCheckedChange={(checked) =>
                  setEditingItem((prev) => ({ ...prev, is_current: checked }))
                }
              />
              <label className="text-sm text-foreground">Currently Active</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                value={editingItem?.description || ""}
                onChange={(e) =>
                  setEditingItem((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="bg-background border-border"
              />
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
                  "Add Entry"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimelineCard({
  item,
  onEdit,
  onDelete,
}: {
  item: TimelineItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-elevated p-4 flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          {item.is_current && (
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
              Current
            </span>
          )}
        </div>
        <p className="text-primary text-sm font-medium">{item.organization}</p>
        {item.location && (
          <p className="text-foreground-muted text-sm">📍 {item.location}</p>
        )}
        <p className="text-foreground-muted text-xs mt-1">
          {format(new Date(item.start_date), "MMM yyyy")} -{" "}
          {item.is_current
            ? "Present"
            : item.end_date
            ? format(new Date(item.end_date), "MMM yyyy")
            : "Present"}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-destructive/10 text-foreground-muted hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
