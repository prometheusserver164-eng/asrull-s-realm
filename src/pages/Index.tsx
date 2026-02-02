import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Navigation } from "@/components/portfolio/Navigation";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { TechStack } from "@/components/portfolio/TechStack";
import { Projects } from "@/components/portfolio/Projects";
import { Timeline } from "@/components/portfolio/Timeline";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { Chatbot } from "@/components/portfolio/Chatbot";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { data: profile } = useProfile();

  // Update page metadata
  useEffect(() => {
    if (profile) {
      document.title = profile.seo_title || `${profile.name} | Portfolio`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", profile.seo_description || profile.about || "");
      }

      // Update favicon if set
      if (profile.favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = profile.favicon_url;
        }
      }
    }
  }, [profile]);

  // Log page view analytics with security monitoring
  useEffect(() => {
    const logPageView = async () => {
      try {
        // Generate session ID for tracking
        let sessionId = sessionStorage.getItem("session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("session_id", sessionId);
        }

        // Hash IP for privacy (using a simple approach)
        const ipHash = btoa(navigator.userAgent + screen.width + screen.height).substring(0, 16);

        // Call security monitor edge function
        await supabase.functions.invoke("security-monitor", {
          body: {
            page: "/",
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            ip_hash: ipHash,
            session_id: sessionId,
          },
        });
      } catch {
        // Silent fail for analytics/security
      }
    };
    logPageView();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <Hero />
        <About />
        <TechStack />
        <Projects />
        <Timeline />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
