import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, Play } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function ProjectCard({ project, index, isInView }: { project: Project; index: number; isInView: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
        onClick={() => setIsOpen(true)}
        className="group card-interactive overflow-hidden cursor-pointer"
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-background-elevated">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-20">🚀</span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Video indicator */}
          {project.video_url && (
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
            </div>
          )}

          {/* Featured badge */}
          {project.is_featured && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-foreground-secondary text-sm mb-4 line-clamp-2">
            {project.description || "A project built with modern technologies."}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.tech_stack?.slice(0, 4).map((tech) => (
              <span key={tech} className="badge-tech">
                {tech}
              </span>
            ))}
            {project.tech_stack && project.tech_stack.length > 4 && (
              <span className="badge-tech">+{project.tech_stack.length - 4}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Project Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{project.title}</DialogTitle>
            <DialogDescription className="text-foreground-secondary">
              {project.description}
            </DialogDescription>
          </DialogHeader>

          {/* Modal Content */}
          <div className="space-y-6 mt-4">
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
          </div>
        </DialogContent>
      </Dialog>
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
              My Work
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Featured Projects
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
