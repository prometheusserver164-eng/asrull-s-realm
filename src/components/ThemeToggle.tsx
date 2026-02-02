import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-card border border-border p-1 transition-colors duration-300 hover:border-primary/50"
      whileTap={{ scale: 0.95 }}
    >
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <Sun className="w-4 h-4 text-amber-500 opacity-50" />
        <Moon className="w-4 h-4 text-primary opacity-50" />
      </div>
      
      {/* Sliding circle */}
      <motion.div
        className="relative z-10 w-5 h-5 rounded-full bg-primary shadow-lg flex items-center justify-center"
        animate={{
          x: theme === "dark" ? 26 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === "dark" ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "dark" ? (
            <Moon className="w-3 h-3 text-primary-foreground" />
          ) : (
            <Sun className="w-3 h-3 text-primary-foreground" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
