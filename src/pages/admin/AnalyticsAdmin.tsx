import { motion } from "framer-motion";
import { Loader2, Eye, TrendingUp, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";

export default function AnalyticsAdmin() {
  // Last 7 days analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics-7days"],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Group by day
  const dailyStats = analytics?.reduce((acc, entry) => {
    const day = format(new Date(entry.created_at), "yyyy-MM-dd");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Get unique pages
  const pageStats = analytics?.reduce((acc, entry) => {
    acc[entry.page] = (acc[entry.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Generate last 7 days labels
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "yyyy-MM-dd");
  });

  const chartData = last7Days.map((day) => ({
    date: format(new Date(day), "MMM d"),
    views: dailyStats[day] || 0,
  }));

  const totalViews = analytics?.length || 0;
  const todayViews = dailyStats[format(new Date(), "yyyy-MM-dd")] || 0;
  const avgViews = Math.round(totalViews / 7);

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
          Analytics
        </h1>
        <p className="text-foreground-secondary">
          Basic visitor statistics for your portfolio.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { label: "Total Views (7 days)", value: totalViews, icon: Eye },
          { label: "Today's Views", value: todayViews, icon: Calendar },
          { label: "Daily Average", value: avgViews, icon: TrendingUp },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className="card-elevated p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-6">
          Views Over Time
        </h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((day, index) => {
            const maxViews = Math.max(...chartData.map((d) => d.views), 1);
            const height = (day.views / maxViews) * 100;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                  className="w-full bg-primary rounded-t-lg relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card border border-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.views} views
                  </div>
                </motion.div>
                <span className="text-xs text-foreground-muted">{day.date}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Page Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card-elevated p-6"
      >
        <h2 className="font-display text-xl font-semibold text-foreground mb-6">
          Pages Visited
        </h2>
        <div className="space-y-4">
          {Object.entries(pageStats)
            .sort(([, a], [, b]) => b - a)
            .map(([page, count]) => (
              <div key={page} className="flex items-center justify-between">
                <span className="text-foreground font-mono text-sm">{page}</span>
                <span className="text-foreground-secondary">{count} views</span>
              </div>
            ))}
        </div>
        {Object.keys(pageStats).length === 0 && (
          <p className="text-foreground-muted text-center py-4">
            No page views recorded yet.
          </p>
        )}
      </motion.div>
    </div>
  );
}
