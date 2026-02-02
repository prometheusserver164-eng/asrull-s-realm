import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, Play, Sparkles, ArrowUpRight } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

function ProjectCard({ project, index, isInView }: { project: Project; index: number; isInView: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        variants={cardVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
        whileHover={{ y: -8 }}
        className="group card-interactive overflow-hidden cursor-pointer relative"
      >
        {/* Animated Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), transparent 50%, hsl(var(--accent) / 0.3))",
          }}
        />

        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-background-elevated">
          {project.image_url ? (
            <motion.img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: isHovered ? [0, 10, -10, 0] : 0,
                  scale: isHovered ? 1.2 : 1 
                }}
                transition={{ duration: 0.5 }}
                className="text-6xl opacity-20"
              >
                🚀
              </motion.div>
            </div>
          )}

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"
          />

          {/* Quick Actions on Hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Live
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 transition-colors"
              >
                <Github className="w-3 h-3" />
                Code
              </a>
            )}
          </motion.div>

          {/* Video indicator */}
          {project.video_url && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center"
            >
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </motion.div>
          )}

          {/* Featured badge */}
          {project.is_featured && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Featured
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 relative">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {project.title}
            </h3>
            <motion.div
              animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </motion.div>
          </div>
          <p className="text-foreground-secondary text-sm mb-4 line-clamp-2">
            {project.description || "A project built with modern technologies."}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.tech_stack?.slice(0, 4).map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="badge-tech"
              >
                {tech}
              </motion.span>
            ))}
            {project.tech_stack && project.tech_stack.length > 4 && (
              <span className="badge-tech">+{project.tech_stack.length - 4}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Project Modal */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{project.title}</DialogTitle>
                <DialogDescription className="text-foreground-secondary">
                  {project.description}
                </DialogDescription>
              </DialogHeader>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 mt-4"
              >
                {/* Image/Video */}
                <div className="aspect-video rounded-lg overflow-hidden bg-background-elevated">
                  {project.video_url ? (
                    <video
                      src={project.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl opacity-20">🚀</span>
                    </div>
                  )}
                </div>

                {/* Long Description */}
                {project.long_description && (
                  <p className="text-foreground-secondary leading-relaxed">
                    {project.long_description}
                  </p>
                )}

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack?.map((tech) => (
                    <span key={tech} className="badge-tech">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {project.live_url && (
                    <Button asChild variant="hero" size="lg">
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        View Live
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button asChild variant="hero-outline" size="lg">
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                        View Code
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: projects } = useProjects();

  // Placeholder projects if none exist
  const displayProjects = projects?.length ? projects : [
    {
      id: "1",
      title: "Minecraft Server Manager",
      description: "A comprehensive dashboard for managing Minecraft servers with real-time monitoring and player analytics.",
      long_description: null,
      image_url: null,
      video_url: null,
      live_url: null,
      github_url: null,
      tech_stack: ["Java", "React", "Node.js", "MySQL"],
      is_featured: true,
      is_published: true,
      sort_order: 1,
    },
    {
      id: "2",
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with payment integration and inventory management.",
      long_description: null,
      image_url: null,
      video_url: null,
      live_url: null,
      github_url: null,
      tech_stack: ["Laravel", "React", "MySQL", "AWS"],
      is_featured: false,
      is_published: true,
      sort_order: 2,
    },
    {
      id: "3",
      title: "Mobile Banking App",
      description: "Cross-platform mobile banking application with secure transactions and biometric auth.",
      long_description: null,
      image_url: null,
      video_url: null,
      live_url: null,
      github_url: null,
      tech_stack: ["Flutter", "Dart", "Firebase"],
      is_featured: false,
      is_published: true,
      sort_order: 3,
    },
  ];

  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.05 } : {}}
          transition={{ duration: 1 }}
          className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-primary blur-3xl"
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium uppercase tracking-widest">
                My Work
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Featured{" "}
              <span className="relative inline-block">
                <span className="gradient-text-accent">Projects</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent origin-left rounded-full"
                />
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              A selection of projects that showcase my skills and passion for development
            </motion.p>
          </div>

          {/* Projects Grid - Bento Style */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isInView={isInView}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
