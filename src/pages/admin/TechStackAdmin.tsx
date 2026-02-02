import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TechIconPicker } from "@/components/TechIconPicker";
import { ImageDropzone } from "@/components/ImageDropzone";

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
  custom_icon_url: string | null;
  icon_scale: number;
  proficiency: number;
  is_featured: boolean;
  sort_order: number;
}

const emptyItem: Partial<TechItem> = {
  name: "",
  category_id: null,
  icon_name: "",
  custom_icon_url: null,
  icon_scale: 100,
  proficiency: 80,
  is_featured: false,
  sort_order: 0,
};

// Mini icon preview for list
function TechIconPreview({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    java: <div className="w-8 h-8 rounded bg-[#5382a1] flex items-center justify-center text-white text-xs font-bold">J</div>,
    javascript: <div className="w-8 h-8 rounded bg-[#f7df1e] flex items-center justify-center text-black text-xs font-bold">JS</div>,
    typescript: <div className="w-8 h-8 rounded bg-[#3178c6] flex items-center justify-center text-white text-xs font-bold">TS</div>,
    php: <div className="w-8 h-8 rounded bg-[#777bb4] flex items-center justify-center text-white text-xs font-bold">P</div>,
    python: <div className="w-8 h-8 rounded bg-gradient-to-br from-[#306998] to-[#ffd43b] flex items-center justify-center text-white text-xs font-bold">Py</div>,
    dart: <div className="w-8 h-8 rounded bg-[#0175c2] flex items-center justify-center text-white text-xs font-bold">D</div>,
    react: <div className="w-8 h-8 rounded bg-[#20232a] flex items-center justify-center text-[#61dafb] text-xs font-bold">R</div>,
    laravel: <div className="w-8 h-8 rounded bg-[#ff2d20] flex items-center justify-center text-white text-xs font-bold">L</div>,
    codeigniter: <div className="w-8 h-8 rounded bg-[#ee4323] flex items-center justify-center text-white text-xs font-bold">CI</div>,
    nodejs: <div className="w-8 h-8 rounded bg-[#339933] flex items-center justify-center text-white text-xs font-bold">N</div>,
    flutter: <div className="w-8 h-8 rounded bg-[#02569b] flex items-center justify-center text-[#54c5f8] text-xs font-bold">F</div>,
    mysql: <div className="w-8 h-8 rounded bg-[#00618a] flex items-center justify-center text-white text-xs font-bold">M</div>,
    mongodb: <div className="w-8 h-8 rounded bg-[#47a248] flex items-center justify-center text-white text-xs font-bold">Mo</div>,
    aws: <div className="w-8 h-8 rounded bg-[#232f3e] flex items-center justify-center text-[#ff9900] text-xs font-bold">A</div>,
    digitalocean: <div className="w-8 h-8 rounded bg-[#0080ff] flex items-center justify-center text-white text-xs font-bold">DO</div>,
    azure: <div className="w-8 h-8 rounded bg-[#0089d6] flex items-center justify-center text-white text-xs font-bold">Az</div>,
    git: <div className="w-8 h-8 rounded bg-[#f05032] flex items-center justify-center text-white text-xs font-bold">G</div>,
    figma: <div className="w-8 h-8 rounded bg-gradient-to-b from-[#f24e1e] via-[#a259ff] to-[#1abcfe] flex items-center justify-center text-white text-xs font-bold">F</div>,
    html: <div className="w-8 h-8 rounded bg-[#e34f26] flex items-center justify-center text-white text-xs font-bold">H</div>,
    css: <div className="w-8 h-8 rounded bg-[#1572b6] flex items-center justify-center text-white text-xs font-bold">C</div>,
    vue: <div className="w-8 h-8 rounded bg-[#42b883] flex items-center justify-center text-white text-xs font-bold">V</div>,
    angular: <div className="w-8 h-8 rounded bg-[#dd0031] flex items-center justify-center text-white text-xs font-bold">A</div>,
    nextjs: <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white text-xs font-bold">N</div>,
    tailwind: <div className="w-8 h-8 rounded bg-[#06b6d4] flex items-center justify-center text-white text-xs font-bold">T</div>,
    docker: <div className="w-8 h-8 rounded bg-[#2496ed] flex items-center justify-center text-white text-xs font-bold">D</div>,
    kubernetes: <div className="w-8 h-8 rounded bg-[#326ce5] flex items-center justify-center text-white text-xs font-bold">K</div>,
    redis: <div className="w-8 h-8 rounded bg-[#dc382d] flex items-center justify-center text-white text-xs font-bold">R</div>,
    postgresql: <div className="w-8 h-8 rounded bg-[#336791] flex items-center justify-center text-white text-xs font-bold">PG</div>,
    firebase: <div className="w-8 h-8 rounded bg-[#ffca28] flex items-center justify-center text-black text-xs font-bold">F</div>,
    supabase: <div className="w-8 h-8 rounded bg-[#3ecf8e] flex items-center justify-center text-white text-xs font-bold">S</div>,
  };
  return icons[name?.toLowerCase()] || <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-foreground-muted text-xs">?</div>;
}

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
                  {item.custom_icon_url ? (
                    <img src={item.custom_icon_url} alt={item.name} className="w-8 h-8 rounded object-contain" />
                  ) : (
                    <TechIconPreview name={item.icon_name || ""} />
                  )}
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
        <DialogContent className="bg-card border-border max-w-lg">
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
                Icon
              </label>
              <Tabs defaultValue={editingItem?.custom_icon_url ? "upload" : "preset"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="preset">Preset Icons</TabsTrigger>
                  <TabsTrigger value="upload">Upload Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="preset">
                  <TechIconPicker
                    value={editingItem?.icon_name || ""}
                    onChange={(value) =>
                      setEditingItem((prev) => ({ ...prev, icon_name: value, custom_icon_url: null }))
                    }
                  />
                </TabsContent>
                <TabsContent value="upload">
                  <ImageDropzone
                    value={editingItem?.custom_icon_url || undefined}
                    onChange={(url) =>
                      setEditingItem((prev) => ({ ...prev, custom_icon_url: url, icon_name: null }))
                    }
                    bucket="tech-icons"
                    folder="logos"
                  />
                  <p className="text-xs text-foreground-muted mt-2">
                    Drag & drop your custom logo (max 5MB)
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Icon Size ({editingItem?.icon_scale || 100}%)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={editingItem?.icon_scale || 100}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      icon_scale: parseInt(e.target.value),
                    }))
                  }
                  className="bg-background flex-1"
                />
                <div className="w-16 h-16 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden">
                  {editingItem?.custom_icon_url ? (
                    <img
                      src={editingItem.custom_icon_url}
                      alt="Preview"
                      style={{
                        width: `${(editingItem?.icon_scale || 100) * 0.32}px`,
                        height: `${(editingItem?.icon_scale || 100) * 0.32}px`,
                      }}
                      className="object-contain"
                    />
                  ) : (
                    <span 
                      className="font-bold gradient-text-accent"
                      style={{ fontSize: `${(editingItem?.icon_scale || 100) * 0.2}px` }}
                    >
                      {editingItem?.name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground-muted mt-2">
                Sesuaikan ukuran icon (50% - 150%)
              </p>
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
