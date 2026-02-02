import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Folder, Code, Mail, Eye, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  // Fetch stats
  const { data: projectCount } = useQuery({
    queryKey: ["admin-project-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: techCount } = useQuery({
    queryKey: ["admin-tech-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("tech_stack")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: messageCount } = useQuery({
    queryKey: ["admin-message-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      return count || 0;
    },
  });

  const { data: pageViews } = useQuery({
    queryKey: ["admin-analytics-today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count } = await supabase
        .from("analytics")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());
      return count || 0;
    },
  });

  const stats = [
    { label: "Projects", value: projectCount, icon: Folder, color: "primary" },
    { label: "Technologies", value: techCount, icon: Code, color: "blue" },
    { label: "Unread Messages", value: messageCount, icon: Mail, color: "green" },
    { label: "Views Today", value: pageViews, icon: Eye, color: "purple" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-foreground-secondary">
          Welcome to your portfolio admin panel.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className="card-elevated p-6 hover:border-primary/30 transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground mb-1">
              {stat.value ?? "..."}
            </p>
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Add New Project", href: "/admin/projects", icon: Folder },
            { label: "Update Profile", href: "/admin/profile", icon: Users },
            { label: "View Messages", href: "/admin/messages", icon: Mail },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors duration-200"
            >
              <action.icon className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{action.label}</span>
            </a>
          ))}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card-elevated p-6 border-primary/20"
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Getting Started
        </h2>
        <p className="text-foreground-secondary mb-4">
          This is your admin dashboard. From here you can manage all aspects of your portfolio:
        </p>
        <ul className="space-y-2 text-foreground-secondary">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Update your profile information and social links
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Add and manage your projects with images and videos
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Customize your tech stack and experience timeline
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            View visitor analytics and contact messages
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
