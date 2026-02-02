import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
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

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });
}

export interface SocialLink {
  id: string;
  type: string;
  url: string;
  label: string | null;
  is_active: boolean;
  sort_order: number;
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as SocialLink[];
    },
  });
}

export interface TechCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface TechItem {
  id: string;
  name: string;
  category_id: string | null;
  icon_name: string | null;
  proficiency: number;
  is_featured: boolean;
  sort_order: number;
  category?: TechCategory;
}

export function useTechStack() {
  return useQuery({
    queryKey: ["tech-stack"],
    queryFn: async () => {
      const { data: categories, error: catError } = await supabase
        .from("tech_categories")
        .select("*")
        .order("sort_order");

      if (catError) throw catError;

      const { data: items, error: itemError } = await supabase
        .from("tech_stack")
        .select("*")
        .order("sort_order");

      if (itemError) throw itemError;

      return {
        categories: categories as TechCategory[],
        items: items as TechItem[],
      };
    },
  });
}

export interface Project {
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

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");

      if (error) throw error;
      return data as Project[];
    },
  });
}

export interface TimelineItem {
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

export function useTimeline() {
  return useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timeline")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return data as TimelineItem[];
    },
  });
}
