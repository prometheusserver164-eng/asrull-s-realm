import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Clock,
  Globe,
  Bot,
  Zap,
  Filter,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  ip_address: string | null;
  user_agent: string | null;
  page: string | null;
  description: string;
  metadata: Record<string, any>;
  is_resolved: boolean;
  created_at: string;
}

const severityConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  low: { color: "text-blue-500", icon: Eye, bg: "bg-blue-500/10" },
  medium: { color: "text-yellow-500", icon: AlertTriangle, bg: "bg-yellow-500/10" },
  high: { color: "text-orange-500", icon: AlertCircle, bg: "bg-orange-500/10" },
  critical: { color: "text-red-500", icon: ShieldAlert, bg: "bg-red-500/10" },
};

const eventTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  bot_detected: { label: "Bot Detected", icon: Bot },
  rate_limit: { label: "Rate Limit", icon: Zap },
  suspicious_activity: { label: "Suspicious Activity", icon: AlertTriangle },
  attack_attempt: { label: "Attack Attempt", icon: ShieldAlert },
  spam_referrer: { label: "Spam Referrer", icon: Globe },
  anomaly: { label: "Anomaly", icon: AlertCircle },
};

export default function SecurityAdmin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unresolved" | "critical">("unresolved");

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["security-events", filter],
    queryFn: async () => {
      let query = supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter === "unresolved") {
        query = query.eq("is_resolved", false);
      } else if (filter === "critical") {
        query = query.in("severity", ["high", "critical"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalResult, unresolvedResult, criticalResult, todayResult] = await Promise.all([
        supabase.from("security_events").select("*", { count: "exact", head: true }),
        supabase.from("security_events").select("*", { count: "exact", head: true }).eq("is_resolved", false),
        supabase.from("security_events").select("*", { count: "exact", head: true }).in("severity", ["high", "critical"]).eq("is_resolved", false),
        supabase.from("security_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      ]);

      return {
        total: totalResult.count || 0,
        unresolved: unresolvedResult.count || 0,
        critical: criticalResult.count || 0,
        today: todayResult.count || 0,
      };
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("security_events")
        .update({ is_resolved: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-events"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
      toast.success("Event marked as resolved");
    },
    onError: (error) => {
      toast.error(`Failed to resolve: ${error.message}`);
    },
  });

  const resolveAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("security_events")
        .update({ is_resolved: true })
        .eq("is_resolved", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-events"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
      toast.success("All events marked as resolved");
    },
    onError: (error) => {
      toast.error(`Failed to resolve all: ${error.message}`);
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Security Monitor
          </h1>
          <p className="text-foreground-secondary">
            AI-powered threat detection and visitor monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {stats?.unresolved && stats.unresolved > 0 && (
            <Button 
              variant="hero-outline" 
              size="sm" 
              onClick={() => resolveAllMutation.mutate()}
              disabled={resolveAllMutation.isPending}
            >
              <CheckCircle className="w-4 h-4" />
              Resolve All
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Events", value: stats?.total || 0, icon: Shield, color: "text-primary" },
          { label: "Unresolved", value: stats?.unresolved || 0, icon: AlertTriangle, color: "text-yellow-500" },
          { label: "Critical/High", value: stats?.critical || 0, icon: ShieldAlert, color: "text-red-500" },
          { label: "Today", value: stats?.today || 0, icon: Clock, color: "text-blue-500" },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="card-elevated p-4 flex items-center gap-3"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color.replace("text-", "bg-") + "/10")}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-2"
      >
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          <Filter className="w-4 h-4" />
          All
        </Button>
        <Button
          variant={filter === "unresolved" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unresolved")}
        >
          <AlertTriangle className="w-4 h-4" />
          Unresolved
        </Button>
        <Button
          variant={filter === "critical" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("critical")}
        >
          <ShieldAlert className="w-4 h-4" />
          Critical/High
        </Button>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">All Clear!</h3>
            <p className="text-foreground-secondary">
              No security events to display. Your site is safe.
            </p>
          </div>
        ) : (
          events.map((event) => {
            const severity = severityConfig[event.severity] || severityConfig.low;
            const eventType = eventTypeConfig[event.event_type] || eventTypeConfig.anomaly;
            const SeverityIcon = severity.icon;
            const EventIcon = eventType.icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "card-elevated p-4 border-l-4 transition-all duration-300",
                  event.is_resolved ? "opacity-60 border-l-green-500" : `border-l-${event.severity === "critical" ? "red" : event.severity === "high" ? "orange" : event.severity === "medium" ? "yellow" : "blue"}-500`
                )}
                style={{
                  borderLeftColor: event.is_resolved 
                    ? "#22c55e" 
                    : event.severity === "critical" 
                    ? "#ef4444" 
                    : event.severity === "high" 
                    ? "#f97316" 
                    : event.severity === "medium" 
                    ? "#eab308" 
                    : "#3b82f6"
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", severity.bg)}>
                      <SeverityIcon className={cn("w-5 h-5", severity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs">
                          <EventIcon className="w-3 h-3 mr-1" />
                          {eventType.label}
                        </Badge>
                        <Badge 
                          variant={event.severity === "critical" ? "destructive" : "secondary"}
                          className="text-xs uppercase"
                        >
                          {event.severity}
                        </Badge>
                        {event.is_resolved && (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground mb-1 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
                        {event.page && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.page}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!event.is_resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveMutation.mutate(event.id)}
                      disabled={resolveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}