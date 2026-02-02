import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { User, Code, Heart } from "lucide-react";
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

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: profile } = useProfile();

  return (
    <section id="about" className="relative py-32 overflow-hidden">
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
              About Me
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Turning Ideas Into Reality
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              {profile?.about || "Full-stack developer passionate about building scalable applications."}
            </motion.p>
          </div>

          {/* About Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {aboutCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="card-interactive p-8 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <card.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-foreground-secondary leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "3+", label: "Years Experience" },
              { value: "20+", label: "Projects Completed" },
              { value: "10+", label: "Technologies" },
              { value: "∞", label: "Lines of Code" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-card/50 border border-border/50"
              >
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
