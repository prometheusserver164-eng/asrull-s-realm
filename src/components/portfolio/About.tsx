import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { User, Code, Heart, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const aboutCards = [
  {
    icon: User,
    title: "Who I Am",
    description: "A passionate developer from Indonesia, currently pursuing Computer Science while building real-world applications.",
  },
  {
    icon: Code,
    title: "What I Build",
    description: "Full-stack web applications, game server backends, and scalable systems using modern technologies.",
  },
  {
    icon: Heart,
    title: "What I Love",
    description: "Clean code, elegant solutions, learning new technologies, and creating seamless user experiences.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: {
    scale: 1.02,
    transition: { type: "spring" as const, stiffness: 400, damping: 17 },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.15,
    rotate: [0, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: profile } = useProfile();

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.1, scale: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-20 -left-32 w-64 h-64 rounded-full bg-primary blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 0.08, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute bottom-20 -right-32 w-80 h-80 rounded-full bg-accent blur-3xl"
        />
      </div>

      <div className="section-container">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium uppercase tracking-widest">
                About Me
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Turning Ideas Into{" "}
              <span className="relative inline-block">
                <span className="gradient-text-accent">Reality</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent origin-left rounded-full"
                />
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              {profile?.about || "Full-stack developer passionate about building scalable applications."}
            </motion.p>
          </div>

          {/* About Cards */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            {aboutCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="card-interactive p-8 group relative overflow-hidden"
              >
                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), transparent, hsl(var(--accent) / 0.2))",
                  }}
                />

                <motion.div
                  variants={iconVariants}
                  className="relative w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
                >
                  <card.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="relative font-display text-xl font-semibold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="relative text-foreground-secondary leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats with Counter Animation */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "3+", label: "Years Experience" },
              { value: "20+", label: "Projects Completed" },
              { value: "10+", label: "Technologies" },
              { value: "∞", label: "Lines of Code" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.8 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring" as const, stiffness: 400 }
                }}
                className="text-center p-6 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors duration-300"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="font-display text-3xl md:text-4xl font-bold gradient-text-accent mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-foreground-muted">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
