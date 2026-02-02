import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

interface Project {
  id: string;
  title: string;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  video_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tech_stack: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

const emptyProject: Partial<Project> = {
  title: "",
  description: "",
  long_description: "",
  image_url: "",
  video_url: "",
  live_url: "",
  github_url: "",
  tech_stack: [],
  is_featured: false,
  is_published: true,
  sort_order: 0,
};

export default function ProjectsAdmin() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [techStackInput, setTechStackInput] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Project[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { error } = await supabase.from("projects").insert([project as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully!");
      setIsDialogOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTechStackInput(project.tech_stack?.join(", ") || "");
    } else {
      setEditingProject(emptyProject);
      setTechStackInput("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) {
      toast.error("Please enter a project title");
      return;
    }

    const projectData = {
      ...editingProject,
      tech_stack: techStackInput.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editingProject.id) {
      updateMutation.mutate(projectData);
    } else {
      createMutation.mutate(projectData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditingProject((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
            Projects
          </h1>
          <p className="text-foreground-secondary">
            Manage your portfolio projects.
          </p>
        </div>
        <Button variant="hero" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="card-elevated overflow-hidden group"
          >
            {/* Image */}
            <div className="aspect-video bg-background-elevated relative">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                  <Globe className="w-8 h-8 text-primary/50" />
                </div>
              )}
              {project.is_featured && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  Featured
                </span>
              )}
              {!project.is_published && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-foreground-muted text-background text-xs rounded-full">
                  Draft
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground">
                {project.title}
              </h3>
              <p className="text-sm text-foreground-secondary line-clamp-2">
                {project.description || "No description"}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1">
                {project.tech_stack?.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-xs px-2 py-0.5 bg-secondary rounded">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex gap-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground-muted hover:text-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground-muted hover:text-primary"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDialog(project)}
                    className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this project?")) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-foreground-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground-muted mb-4">No projects yet.</p>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4" />
            Add your first project
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingProject?.id ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <Input
                  name="title"
                  value={editingProject?.title || ""}
                  onChange={handleChange}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort Order
                </label>
                <Input
                  name="sort_order"
                  type="number"
                  value={editingProject?.sort_order || 0}
                  onChange={handleChange}
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Short Description
              </label>
              <Textarea
                name="description"
                value={editingProject?.description || ""}
                onChange={handleChange}
                rows={2}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Long Description
              </label>
              <Textarea
                name="long_description"
                value={editingProject?.long_description || ""}
                onChange={handleChange}
                rows={4}
                className="bg-background border-border"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL
                </label>
                <Input
                  name="image_url"
                  value={editingProject?.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video URL
                </label>
                <Input
                  name="video_url"
                  value={editingProject?.video_url || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Live URL
                </label>
                <Input
                  name="live_url"
                  value={editingProject?.live_url || ""}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GitHub URL
                </label>
                <Input
                  name="github_url"
                  value={editingProject?.github_url || ""}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tech Stack (comma-separated)
              </label>
              <Input
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="React, Node.js, MySQL"
                className="bg-background border-border"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={editingProject?.is_featured || false}
                  onCheckedChange={(checked) =>
                    setEditingProject((prev) => ({ ...prev, is_featured: checked }))
                  }
                />
                <label className="text-sm text-foreground">Featured</label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editingProject?.is_published ?? true}
                  onCheckedChange={(checked) =>
                    setEditingProject((prev) => ({ ...prev, is_published: checked }))
                  }
                />
                <label className="text-sm text-foreground">Published</label>
              </div>
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
                ) : editingProject?.id ? (
                  "Save Changes"
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
