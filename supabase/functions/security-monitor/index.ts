import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyticsData {
  page: string;
  referrer?: string;
  user_agent?: string;
  ip_hash?: string;
  session_id?: string;
}

interface ThreatAnalysis {
  is_suspicious: boolean;
  threat_level: "low" | "medium" | "high" | "critical";
  reasons: string[];
  event_type?: string;
}

// Known bot patterns
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python-requests/i, /java/i, /libwww/i, /phantom/i, /headless/i,
  /selenium/i, /puppeteer/i, /playwright/i
];

// Suspicious patterns
const SUSPICIOUS_PATHS = [
  /\.env/i, /\.git/i, /wp-admin/i, /wp-login/i, /phpmyadmin/i,
  /admin\.php/i, /shell/i, /eval/i, /exec/i, /\.sql/i, /backup/i,
  /\.bak/i, /\.config/i, /\.htaccess/i, /\.htpasswd/i
];

const SUSPICIOUS_REFERRERS = [
  /spam/i, /casino/i, /poker/i, /viagra/i, /crypto-scam/i
];

function analyzeRequest(data: AnalyticsData): ThreatAnalysis {
  const reasons: string[] = [];
  let threatLevel: "low" | "medium" | "high" | "critical" = "low";
  
  const userAgent = data.user_agent || "";
  const page = data.page || "";
  const referrer = data.referrer || "";

  // Check for bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      reasons.push(`Bot detected: ${userAgent.substring(0, 50)}`);
      threatLevel = "medium";
      break;
    }
  }

  // Check for suspicious paths
  for (const pattern of SUSPICIOUS_PATHS) {
    if (pattern.test(page)) {
      reasons.push(`Suspicious path access: ${page}`);
      threatLevel = "high";
      break;
    }
  }

  // Check for suspicious referrers
  for (const pattern of SUSPICIOUS_REFERRERS) {
    if (pattern.test(referrer)) {
      reasons.push(`Suspicious referrer: ${referrer.substring(0, 50)}`);
      threatLevel = "medium";
      break;
    }
  }

  // Check for missing user agent (potential scraper)
  if (!userAgent || userAgent.length < 10) {
    reasons.push("Missing or minimal user agent");
    if (threatLevel === "low") threatLevel = "medium";
  }

  // Check for SQL injection attempts in page
  if (/('|"|;|--|\/\*|\*\/|union|select|insert|delete|drop|update|exec)/i.test(page)) {
    reasons.push("Potential SQL injection attempt");
    threatLevel = "critical";
  }

  // Check for XSS attempts
  if (/<script|javascript:|on\w+=/i.test(page)) {
    reasons.push("Potential XSS attempt");
    threatLevel = "critical";
  }

  return {
    is_suspicious: reasons.length > 0,
    threat_level: threatLevel,
    reasons,
    event_type: reasons.length > 0 ? determineEventType(reasons) : undefined
  };
}

function determineEventType(reasons: string[]): string {
  const reasonsText = reasons.join(" ").toLowerCase();
  if (reasonsText.includes("sql") || reasonsText.includes("xss")) return "attack_attempt";
  if (reasonsText.includes("bot")) return "bot_detected";
  if (reasonsText.includes("suspicious path")) return "suspicious_activity";
  if (reasonsText.includes("referrer")) return "spam_referrer";
  return "anomaly";
}

async function analyzeWithAI(
  supabaseUrl: string,
  supabaseKey: string,
  data: AnalyticsData,
  recentEvents: any[]
): Promise<ThreatAnalysis | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.log("LOVABLE_API_KEY not configured, skipping AI analysis");
    return null;
  }

  try {
    // Build context from recent activity
    const recentSummary = recentEvents.slice(0, 10).map(e => ({
      page: e.page,
      time: e.created_at,
      ip_hash: e.ip_hash
    }));

    const prompt = `You are a security analyst. Analyze this web traffic for potential threats.

Current request:
- Page: ${data.page}
- User Agent: ${data.user_agent || "none"}
- Referrer: ${data.referrer || "none"}
- IP Hash: ${data.ip_hash || "unknown"}

Recent activity from same session/IP (last 10 requests):
${JSON.stringify(recentSummary, null, 2)}

Analyze for:
1. Unusual request patterns (rapid requests, scanning behavior)
2. Potential automated attacks
3. Suspicious navigation patterns
4. Any other anomalies

Respond with JSON only:
{
  "is_suspicious": boolean,
  "threat_level": "low" | "medium" | "high" | "critical",
  "reasons": ["reason1", "reason2"],
  "event_type": "anomaly" | "bot_detected" | "rate_limit" | "attack_attempt" | "suspicious_activity"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a security analyst AI. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return null;
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("AI analysis error:", error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const data: AnalyticsData = await req.json();
    console.log("Analyzing request:", { page: data.page, user_agent: data.user_agent?.substring(0, 50) });

    // First, do rule-based analysis
    const ruleAnalysis = analyzeRequest(data);
    
    // Get recent events for pattern analysis
    const { data: recentEvents } = await supabase
      .from("analytics")
      .select("page, created_at, ip_hash, session_id")
      .eq("ip_hash", data.ip_hash)
      .order("created_at", { ascending: false })
      .limit(20);

    // Check for rate limiting (more than 30 requests in 1 minute from same IP)
    if (recentEvents && recentEvents.length > 0) {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentCount = recentEvents.filter(
        e => new Date(e.created_at) > oneMinuteAgo
      ).length;
      
      if (recentCount > 30) {
        ruleAnalysis.is_suspicious = true;
        ruleAnalysis.threat_level = "high";
        ruleAnalysis.reasons.push(`Rate limit exceeded: ${recentCount} requests/minute`);
        ruleAnalysis.event_type = "rate_limit";
      }
    }

    // If rule-based analysis found something, or for sampling (1 in 10 requests), do AI analysis
    let finalAnalysis = ruleAnalysis;
    const shouldDoAIAnalysis = ruleAnalysis.is_suspicious || Math.random() < 0.1;
    
    if (shouldDoAIAnalysis) {
      const aiAnalysis = await analyzeWithAI(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, data, recentEvents || []);
      if (aiAnalysis && aiAnalysis.is_suspicious) {
        // Merge AI findings
        finalAnalysis = {
          is_suspicious: true,
          threat_level: compareThreatLevels(ruleAnalysis.threat_level, aiAnalysis.threat_level),
          reasons: [...new Set([...ruleAnalysis.reasons, ...aiAnalysis.reasons])],
          event_type: aiAnalysis.event_type || ruleAnalysis.event_type
        };
      }
    }

    // Log the analytics with suspicious flag
    const { error: analyticsError } = await supabase.from("analytics").insert({
      page: data.page,
      referrer: data.referrer,
      user_agent: data.user_agent,
      ip_hash: data.ip_hash,
      session_id: data.session_id,
      is_suspicious: finalAnalysis.is_suspicious
    });

    if (analyticsError) {
      console.error("Failed to log analytics:", analyticsError);
    }

    // If suspicious, create a security event
    if (finalAnalysis.is_suspicious) {
      const { error: securityError } = await supabase.from("security_events").insert({
        event_type: finalAnalysis.event_type || "anomaly",
        severity: finalAnalysis.threat_level,
        ip_address: data.ip_hash,
        user_agent: data.user_agent,
        page: data.page,
        description: finalAnalysis.reasons.join("; "),
        metadata: {
          referrer: data.referrer,
          session_id: data.session_id,
          analysis_source: shouldDoAIAnalysis ? "ai_enhanced" : "rule_based"
        }
      });

      if (securityError) {
        console.error("Failed to log security event:", securityError);
      } else {
        console.log("Security event logged:", finalAnalysis.event_type, finalAnalysis.threat_level);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        is_suspicious: finalAnalysis.is_suspicious 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Security monitor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function compareThreatLevels(a: string, b: string): "low" | "medium" | "high" | "critical" {
  const levels = { low: 0, medium: 1, high: 2, critical: 3 };
  return levels[a as keyof typeof levels] > levels[b as keyof typeof levels] ? a as any : b as any;
}