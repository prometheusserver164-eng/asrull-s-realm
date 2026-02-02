import { motion } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

const languages: { code: Language; label: string }[] = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-0.5 p-1 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm", className)}>
      <Globe className="w-3.5 h-3.5 text-foreground-muted mx-1.5" />
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
            language === lang.code
              ? "text-primary-foreground"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          {language === lang.code && (
            <motion.div
              layoutId="lang-indicator"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 font-semibold">{lang.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
