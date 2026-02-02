import { motion } from "framer-motion";
import { useProfile, useSocialLinks } from "@/hooks/useProfile";
import { Heart, Instagram, Mail, Github, Linkedin, Twitter, Youtube, Globe, ArrowUp } from "lucide-react";

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative py-12 sm:py-14 lg:py-16 border-t border-border/50 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.05 }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[500px] lg:w-[600px] h-[200px] sm:h-[250px] lg:h-[300px] rounded-full bg-primary blur-3xl"
        />
      </div>

      <div className="section-container px-4 sm:px-6 lg:px-8 relative">
        {/* Scroll to Top Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="absolute -top-6 sm:-top-7 lg:-top-8 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow duration-300"
        >
          <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6 sm:gap-7 lg:gap-8 pt-6 sm:pt-7 lg:pt-8"
        >
          {/* Logo */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-2xl sm:text-2xl lg:text-3xl font-bold text-foreground"
          >
            {profile?.nickname || "Asrull"}
            <span className="text-primary">.</span>
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
          >
            {socialLinks?.map((link, index) => {
              const IconComponent = socialIcons[link.type] || Globe;
              return (
                <motion.a
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.15, y: -3 }}
                  href={link.type === "email" ? `mailto:${link.url}` : link.url}
                  target={link.type === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-foreground-secondary group-hover:text-primary transition-colors" />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-24 sm:w-28 lg:w-32 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />

          {/* Made with Love */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-foreground-muted"
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary fill-primary" />
            </motion.div>
            <span>in Indonesia</span>
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-[10px] sm:text-xs text-foreground-muted text-center"
          >
            © {new Date().getFullYear()} {profile?.name || "Mohammad Nasrulloh"}. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}
