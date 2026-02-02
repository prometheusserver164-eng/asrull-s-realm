import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useRef } from "react";

// Floating particles component
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const { data: profile } = useProfile();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="hero-gradient" />
      <FloatingParticles />

      {/* Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/20 blur-3xl"
      />

      <motion.div style={{ y }} className="section-container relative z-10 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Location Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 mb-6 sm:mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </motion.div>
            <span className="text-xs sm:text-sm text-foreground-secondary">
              {profile?.location || "Indonesia"}
            </span>
          </motion.div>

          {/* Name with Animated Reveal */}
          <div className="mb-3 sm:mb-4">
            <motion.span
              custom={1}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="block text-base sm:text-lg md:text-xl text-foreground-secondary font-medium mb-1 sm:mb-2"
            >
              Hello, I'm
            </motion.span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
              <motion.span
                custom={2}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className="block text-foreground"
              >
                {profile?.name?.split(" ")[0] || "Mohammad"}
              </motion.span>
              <motion.span
                custom={3}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className="block gradient-text-accent relative"
              >
                {profile?.name?.split(" ").slice(1).join(" ") || "Nasrulloh"}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                  className="absolute -bottom-1 sm:-bottom-2 left-1/4 w-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-accent origin-left rounded-full"
                />
              </motion.span>
            </h1>
          </div>

          {/* Title */}
          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="text-lg sm:text-xl md:text-2xl text-foreground-secondary font-light mb-4 sm:mb-6"
          >
            {profile?.title || "Full-Stack Developer"}
          </motion.p>

          {/* Education Badge */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary/10 border border-primary/20 mb-8 sm:mb-12"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm text-primary font-medium">
              {profile?.education || "Computer Science Student"}
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="hero"
                size="lg"
                onClick={scrollToProjects}
                className="min-w-[160px] sm:min-w-[180px] text-sm sm:text-base"
              >
                View Projects
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="hero-outline"
                size="lg"
                onClick={scrollToContact}
                className="min-w-[160px] sm:min-w-[180px] text-sm sm:text-base"
              >
                Contact Me
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 sm:gap-2 text-foreground-muted cursor-pointer"
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
