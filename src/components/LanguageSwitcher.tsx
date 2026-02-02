import { motion } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "id", label: "ID", flag: "🇮🇩" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-full bg-card/50 border border-border/50", className)}>
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1",
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
          <span className="relative z-10">{lang.flag}</span>
          <span className="relative z-10">{lang.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
