import { motion } from "framer-motion";
import { useProfile, useSocialLinks } from "@/hooks/useProfile";
import { Heart, Instagram, Mail, Github, Linkedin, Twitter, Youtube, Globe } from "lucide-react";

const socialIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  email: Mail,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  discord: Globe,
  website: Globe,
};

export function Footer() {
  const { data: profile } = useProfile();
  const { data: socialLinks } = useSocialLinks();

  return (
    <footer className="py-12 border-t border-border/50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <p className="font-display text-lg font-bold text-foreground mb-1">
              {profile?.nickname || "Asrull"}
              <span className="text-primary">.</span>
            </p>
            <p className="text-sm text-foreground-muted">
              © {new Date().getFullYear()} {profile?.name || "Mohammad Nasrulloh"}. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks?.map((link) => {
              const IconComponent = socialIcons[link.type] || Globe;
              return (
                <a
                  key={link.id}
                  href={link.type === "email" ? `mailto:${link.url}` : link.url}
                  target={link.type === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <IconComponent className="w-5 h-5 text-foreground-secondary group-hover:text-primary transition-colors" />
                </a>
              );
            })}
          </div>

          {/* Made with Love */}
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span>in Indonesia</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
