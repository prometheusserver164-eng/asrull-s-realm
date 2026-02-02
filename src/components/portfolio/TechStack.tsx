import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTechStack } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useTechStack();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!data) return null;

  const { categories, items } = data;

  // Group items by category
  const groupedItems = categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.category_id === category.id),
  }));

  // Get all unique items for the "All" view
  const allItems = items;

  const displayItems = activeCategory
    ? items.filter((item) => item.category_id === activeCategory)
    : allItems;

  return (
    <section
      id="skills"
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            Tech Stack
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Skills & Technologies</span>
          </h2>
          <p className="text-foreground-secondary max-w-2xl mx-auto text-lg">
            Tools and technologies I use to bring ideas to life
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
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
          {groupedItems.map((category) => (
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
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
                layout: { duration: 0.3 },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group"
            >
              <div className="relative h-full p-4 rounded-2xl bg-card border border-border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Proficiency indicator bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${item.proficiency}%` } : {}}
                    transition={{ duration: 0.8, delay: index * 0.03 + 0.3 }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  {/* Tech Logo */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background/50 border border-border/50 group-hover:border-primary/30 transition-colors duration-300 overflow-hidden">
                    {item.custom_icon_url ? (
                      <img
                        src={item.custom_icon_url}
                        alt={item.name}
                        className="w-8 h-8 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xl font-bold gradient-text-accent">
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {item.name}
                    </h3>
                    
                    {/* Proficiency percentage */}
                    <span className="text-xs text-foreground-muted">
                      {item.proficiency}%
                    </span>
                  </div>
                </div>

                {/* Featured badge */}
                {item.is_featured && (
                  <div className="absolute top-2 right-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse block" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { label: "Technologies", value: allItems.length },
            { label: "Categories", value: categories.length },
            { label: "Featured", value: allItems.filter((i) => i.is_featured).length },
            { label: "Avg. Proficiency", value: `${Math.round(allItems.reduce((acc, i) => acc + i.proficiency, 0) / allItems.length || 0)}%` },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="text-center p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text-accent mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-foreground-muted">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
