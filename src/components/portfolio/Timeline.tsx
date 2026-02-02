import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Briefcase, MapPin, Trophy, Sparkles } from "lucide-react";
import { useTimeline } from "@/hooks/useProfile";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

const typeIcons: Record<string, React.ElementType> = {
  education: GraduationCap,
  experience: Briefcase,
  achievement: Trophy,
};

const typeColors: Record<string, string> = {
  education: "from-blue-500 to-indigo-600",
  experience: "from-emerald-500 to-teal-600",
  achievement: "from-amber-500 to-orange-600",
};

export function Timeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: timeline } = useTimeline();
  const { t } = useLanguage();

  const displayTimeline = timeline?.length ? timeline : [
    {
      id: "1",
      type: "education",
      title: "Bachelor of Computer Science",
      organization: "University of Technology",
      location: "Indonesia",
      start_date: "2022-08-01",
      end_date: null,
      is_current: true,
      description: "Currently pursuing a degree in Computer Science, focusing on software engineering and system design.",
      sort_order: 1,
    },
    {
      id: "2",
      type: "experience",
      title: "Game Server Developer",
      organization: "Freelance",
      location: "Remote",
      start_date: "2020-01-01",
      end_date: null,
      is_current: true,
      description: "Developing and managing custom Minecraft servers with unique gameplay features and optimized performance.",
      sort_order: 2,
    },
  ];

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM yyyy");
  };

  return (
    <section id="experience" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-background-secondary">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.05 } : {}}
          transition={{ duration: 1 }}
          className="absolute top-1/3 -left-32 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-primary blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.03 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-1/3 -right-32 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-accent blur-3xl"
        />
      </div>

      <div className="section-container px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-3 sm:mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-primary text-xs sm:text-sm font-medium uppercase tracking-widest">
                {t("timeline.label")}
              </span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6"
            >
              {t("timeline.title_1")}{" "}
              <span className="relative inline-block">
                <span className="gradient-text-accent">{t("timeline.title_2")}</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent origin-left rounded-full"
                />
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-foreground-secondary max-w-2xl mx-auto px-4"
            >
              {t("timeline.subtitle")}
            </motion.p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute left-6 sm:left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-border to-primary/20 lg:-translate-x-px origin-top"
            />

            {/* Timeline Items */}
            <div className="space-y-8 sm:space-y-10 lg:space-y-12">
              {displayTimeline.map((item, index) => {
                const isLeft = index % 2 === 0;
                const Icon = typeIcons[item.type] || Briefcase;
                const gradientColor = typeColors[item.type] || typeColors.experience;
                const isAchievement = item.type === "achievement";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4 + index * 0.15,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className={`relative flex items-start gap-4 sm:gap-6 lg:gap-8 ${
                      isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.5 + index * 0.15,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`absolute left-6 sm:left-8 lg:left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center z-10 shadow-lg ${isAchievement ? "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-background" : ""}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      {isAchievement && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-transparent"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className={`ml-16 sm:ml-20 lg:ml-0 lg:w-[calc(50%-2rem)] ${isLeft ? "lg:pr-8 lg:text-right" : "lg:pl-8"}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`card-elevated p-4 sm:p-5 lg:p-6 hover:border-primary/30 transition-all duration-300 ${isAchievement ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent" : ""}`}
                      >
                        {/* Achievement Badge */}
                        {isAchievement && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-1 mb-2 sm:mb-3 ${isLeft ? "lg:justify-end" : ""}`}
                          >
                            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                            <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wide">
                              {t("timeline.achievement")}
                            </span>
                          </motion.div>
                        )}

                        {/* Date Badge */}
                        <div className={`flex items-center gap-2 mb-2 sm:mb-3 ${isLeft ? "lg:justify-end" : ""}`}>
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${isAchievement ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"}`}>
                            {formatDate(item.start_date)} - {item.is_current ? t("timeline.present") : item.end_date ? formatDate(item.end_date) : ""}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>

                        {/* Organization */}
                        <p className={`text-sm sm:text-base font-medium mb-1 sm:mb-2 ${isAchievement ? "text-amber-500" : "text-primary"}`}>
                          {item.organization}
                        </p>

                        {/* Location */}
                        {item.location && (
                          <p className={`text-foreground-muted text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-1 ${isLeft ? "lg:justify-end" : ""}`}>
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </p>
                        )}

                        {/* Description */}
                        {item.description && (
                          <p className="text-foreground-secondary text-xs sm:text-sm leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
