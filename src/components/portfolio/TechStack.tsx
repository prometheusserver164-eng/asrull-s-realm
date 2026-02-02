import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTechStack } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

// Tech icons mapping
const techIcons: Record<string, string> = {
  java: "☕",
  javascript: "🟨",
  typescript: "💙",
  php: "🐘",
  python: "🐍",
  dart: "🎯",
  react: "⚛️",
  laravel: "🔴",
  codeigniter: "🔥",
  nodejs: "💚",
  flutter: "🦋",
  mysql: "🐬",
  mongodb: "🍃",
  aws: "☁️",
  digitalocean: "💧",
  azure: "🔷",
  git: "📦",
  figma: "🎨",
};

export function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: techData } = useTechStack();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = techData?.categories || [];
  const items = techData?.items || [];

  const filteredItems = activeCategory
    ? items.filter((item) => item.category_id === activeCategory)
    : items;

  return (
    <section id="tech-stack" className="relative py-32 overflow-hidden bg-background-secondary">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block text-primary text-sm font-medium uppercase tracking-widest mb-4"
            >
              Tech Stack
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Technologies I Work With
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              From frontend to backend, databases to cloud — here's my toolkit
            </motion.p>
          </div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === null
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border text-foreground-secondary hover:border-primary/50 hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border border-border text-foreground-secondary hover:border-primary/50 hover:text-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Tech Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.1 * (index % 10) }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                {/* Featured Badge */}
                {item.is_featured && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary animate-pulse" />
                )}

                {/* Icon */}
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {techIcons[item.icon_name || ""] || "🔧"}
                </div>

                {/* Name */}
                <h3 className="font-medium text-foreground mb-2">{item.name}</h3>

                {/* Proficiency Bar */}
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${item.proficiency}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                  />
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-xl bg-primary/5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
