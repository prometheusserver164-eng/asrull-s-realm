import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Briefcase, MapPin } from "lucide-react";
import { useTimeline } from "@/hooks/useProfile";
import { format } from "date-fns";

export function Timeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: timeline } = useTimeline();

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
    <section id="experience" className="relative py-32 overflow-hidden bg-background-secondary">
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block text-primary text-sm font-medium uppercase tracking-widest mb-4"
            >
              Journey
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Experience & Education
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              My professional journey and academic background
            </motion.p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {displayTimeline.map((item, index) => {
                const isLeft = index % 2 === 0;
                const Icon = item.type === "education" ? GraduationCap : Briefcase;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                    className={`relative flex items-start gap-8 ${
                      isLeft ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Icon */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    {/* Content */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                      <div className="card-elevated p-6 hover:border-primary/30 transition-colors duration-300">
                        {/* Date Badge */}
                        <div className={`flex items-center gap-2 mb-3 ${isLeft ? "md:justify-end" : ""}`}>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {formatDate(item.start_date)} - {item.is_current ? "Present" : item.end_date ? formatDate(item.end_date) : ""}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>

                        {/* Organization */}
                        <p className="text-primary font-medium mb-2">
                          {item.organization}
                        </p>

                        {/* Location */}
                        {item.location && (
                          <p className="text-foreground-muted text-sm mb-3 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </p>
                        )}

                        {/* Description */}
                        {item.description && (
                          <p className="text-foreground-secondary text-sm leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
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
