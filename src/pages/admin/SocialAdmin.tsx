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

type SocialType = "instagram" | "email" | "github" | "linkedin" | "twitter" | "youtube" | "discord" | "website";

interface SocialLink {
  id: string;
  type: SocialType;
  url: string;
  label: string | null;
  is_active: boolean;
  sort_order: number;
}

const socialTypes: SocialType[] = [
  "instagram",
  "email",
  "github",
  "linkedin",
  "twitter",
  "youtube",
  "discord",
  "website",
];

const emptyLink: Partial<SocialLink> = {
  type: "instagram",
  url: "",
  label: "",
  is_active: true,
  sort_order: 0,
};

export default function SocialAdmin() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);

  const { data: links, isLoading } = useQuery({
    queryKey: ["admin-social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as SocialLink[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (link: Partial<SocialLink>) => {
      const { error } = await supabase.from("social_links").insert([link as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-links"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Social link added!");
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (link: Partial<SocialLink>) => {
      const { error } = await supabase
        .from("social_links")
        .update(link)
        .eq("id", link.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-links"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Social link updated!");
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-links"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Social link deleted!");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleOpenDialog = (link?: SocialLink) => {
    if (link) {
      setEditingLink(link);
    } else {
      setEditingLink(emptyLink);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.url) {
      toast.error("Please enter a URL");
      return;
    }

    if (editingLink.id) {
      updateMutation.mutate(editingLink);
    } else {
      createMutation.mutate(editingLink);
    }
  };

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
            Social Links
          </h1>
          <p className="text-foreground-secondary">
            Manage your social media links.
          </p>
        </div>
        <Button variant="hero" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          Add Link
        </Button>
      </motion.div>

      {/* Links List */}
      <div className="space-y-4">
        {links?.map((link, index) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`card-elevated p-4 flex items-center justify-between ${
              !link.is_active ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg capitalize">
                {link.type === "instagram"
                  ? "📸"
                  : link.type === "email"
                  ? "✉️"
                  : link.type === "github"
                  ? "🐙"
                  : link.type === "linkedin"
                  ? "💼"
                  : link.type === "twitter"
                  ? "🐦"
                  : link.type === "youtube"
                  ? "📺"
                  : link.type === "discord"
                  ? "💬"
                  : "🌐"}
              </div>
              <div>
                <p className="font-medium text-foreground capitalize">
                  {link.label || link.type}
                </p>
                <p className="text-sm text-foreground-muted truncate max-w-[300px]">
                  {link.url}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenDialog(link)}
                className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this social link?")) {
                    deleteMutation.mutate(link.id);
                  }
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 text-foreground-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {links?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground-muted mb-4">No social links yet.</p>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4" />
            Add your first link
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingLink?.id ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <Select
                value={editingLink?.type}
                onValueChange={(value) =>
                  setEditingLink((prev) => ({ ...prev, type: value as SocialType }))
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {socialTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL
              </label>
              <Input
                value={editingLink?.url || ""}
                onChange={(e) =>
                  setEditingLink((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://..."
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Label (optional)
              </label>
              <Input
                value={editingLink?.label || ""}
                onChange={(e) =>
                  setEditingLink((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Custom label"
                className="bg-background border-border"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editingLink?.is_active ?? true}
                onCheckedChange={(checked) =>
                  setEditingLink((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <label className="text-sm text-foreground">Active</label>
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
                ) : editingLink?.id ? (
                  "Save"
                ) : (
                  "Add Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
