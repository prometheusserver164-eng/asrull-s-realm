import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileData {
  id: string;
  name: string;
  nickname: string | null;
  title: string | null;
  education: string | null;
  location: string | null;
  about: string | null;
  avatar_url: string | null;
  favicon_url: string | null;
  accent_color: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export default function ProfileAdmin() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profile").select("*").single();
      if (error) throw error;
      return data as ProfileData;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      const { error } = await supabase
        .from("profile")
        .update(data)
        .eq("id", profile?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Profile Settings
        </h1>
        <p className="text-foreground-secondary">
          Update your personal information displayed on the portfolio.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Basic Info */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nickname
              </label>
              <Input
                name="nickname"
                value={formData.nickname || ""}
                onChange={handleChange}
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <Input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Education
              </label>
              <Input
                name="education"
                value={formData.education || ""}
                onChange={handleChange}
                className="bg-card border-border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <Input
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                className="bg-card border-border"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                About
              </label>
              <Textarea
                name="about"
                value={formData.about || ""}
                onChange={handleChange}
                rows={4}
                className="bg-card border-border"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Media & Appearance
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Avatar URL
              </label>
              <Input
                name="avatar_url"
                value={formData.avatar_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Favicon URL
              </label>
              <Input
                name="favicon_url"
                value={formData.favicon_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-card border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Accent Color
              </label>
              <div className="flex gap-3">
                <Input
                  name="accent_color"
                  value={formData.accent_color || ""}
                  onChange={handleChange}
                  placeholder="#7F1D1D"
                  className="bg-card border-border flex-1"
                />
                <div
                  className="w-12 h-10 rounded-lg border border-border"
                  style={{ backgroundColor: formData.accent_color || "#7F1D1D" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card-elevated p-6 space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            SEO Settings
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SEO Title
              </label>
              <Input
                name="seo_title"
                value={formData.seo_title || ""}
                onChange={handleChange}
                placeholder="Your Name | Developer"
                className="bg-card border-border"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Keep under 60 characters for best results
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SEO Description
              </label>
              <Textarea
                name="seo_description"
                value={formData.seo_description || ""}
                onChange={handleChange}
                rows={3}
                placeholder="A brief description of your portfolio..."
                className="bg-card border-border"
              />
              <p className="text-xs text-foreground-muted mt-1">
                Keep under 160 characters for best results
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" variant="hero" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}
