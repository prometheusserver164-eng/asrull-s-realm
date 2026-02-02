import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch portfolio data
    const [profileRes, projectsRes, techStackRes, timelineRes, socialLinksRes] = await Promise.all([
      supabase.from("profile").select("*").single(),
      supabase.from("projects").select("*").eq("is_published", true).order("sort_order"),
      supabase.from("tech_stack").select("*, tech_categories(name)").order("sort_order"),
      supabase.from("timeline").select("*").order("start_date", { ascending: false }),
      supabase.from("social_links").select("*").eq("is_active", true),
    ]);

    const profile = profileRes.data;
    const projects = projectsRes.data || [];
    const techStack = techStackRes.data || [];
    const timeline = timelineRes.data || [];
    const socialLinks = socialLinksRes.data || [];

    // Build context from portfolio data
    const portfolioContext = `
## About ${profile?.name || "Asrull"}
- Nickname: ${profile?.nickname || "Asrull"}
- Title: ${profile?.title || "Full-Stack Developer"}
- Location: ${profile?.location || "Indonesia"}
- Education: ${profile?.education || "Computer Science Student"}
- About: ${profile?.about || "Passionate developer building web applications."}

## Projects (${projects.length} total)
${projects.map((p: any) => `- **${p.title}**: ${p.description || "No description"} ${p.tech_stack?.length ? `(Tech: ${p.tech_stack.join(", ")})` : ""}`).join("\n")}

## Tech Stack
${techStack.map((t: any) => `- ${t.name}${t.tech_categories?.name ? ` (${t.tech_categories.name})` : ""}`).join("\n")}

## Experience & Education Timeline
${timeline.map((t: any) => `- **${t.title}** at ${t.organization} (${t.start_date}${t.end_date ? ` - ${t.end_date}` : " - Present"})${t.description ? `: ${t.description}` : ""}`).join("\n")}

## Contact & Social Links
${socialLinks.map((s: any) => `- ${s.type}: ${s.url}`).join("\n")}
`;

    const systemPrompt = `You are Asrull's portfolio assistant chatbot. You help visitors learn about Asrull, his projects, skills, and experience.

PORTFOLIO DATA:
${portfolioContext}

INSTRUCTIONS:
- Be friendly, helpful, and conversational
- Answer questions about Asrull's background, projects, skills, and experience
- If asked about contact, provide the social links available
- Keep responses concise but informative
- Use markdown formatting when helpful
- If you don't know something specific, say so honestly
- Respond in the same language as the user's message (Indonesian or English)
- Be enthusiastic about Asrull's work and achievements`;

    // Build messages for AI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
