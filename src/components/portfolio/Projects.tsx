import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Github, Play, Sparkles, ArrowUpRight, Globe, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

        {/* Media Carousel - Website Preview / Image / Video */}
        <div className="relative aspect-video overflow-hidden bg-background-elevated">
          <ProjectMediaCarousel project={project} isHovered={isHovered} />

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
        <div className="p-4 sm:p-5 lg:p-6 relative">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-display text-base sm:text-lg lg:text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {project.title}
            </h3>
            <motion.div
              animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 ml-2" />
            </motion.div>
          </div>
          <p className="text-foreground-secondary text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
            {project.description || "A project built with modern technologies."}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {project.tech_stack?.slice(0, 3).map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="badge-tech text-[10px] sm:text-xs"
              >
                {tech}
              </motion.span>
            ))}
            {project.tech_stack && project.tech_stack.length > 3 && (
              <span className="badge-tech text-[10px] sm:text-xs">+{project.tech_stack.length - 3}</span>
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

// Website Preview Component with iframe
function WebsitePreview({ 
  url, 
  fallbackImage,
  title 
}: { 
  url: string; 
  fallbackImage?: string | null;
  title: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showIframe, setShowIframe] = useState(true);

  // Reset states when URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setShowIframe(true);
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // If iframe fails or no URL, show fallback image
  if (hasError || !showIframe) {
    return fallbackImage ? (
      <img
        src={fallbackImage}
        alt={title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-foreground-muted">
        <Globe className="w-12 h-12 opacity-30" />
        <span className="text-sm">Preview not available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-elevated">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Globe className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <span className="text-sm text-foreground-muted">Loading preview...</span>
          </div>
        </div>
      )}
      
      {/* Iframe wrapper with scaling for preview */}
      <div className="w-full h-full overflow-hidden">
        <iframe
          src={url}
          title={`Preview of ${title}`}
          className={cn(
            "w-[200%] h-[200%] origin-top-left scale-50 border-0",
            isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500"
          )}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      </div>

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-card/20 to-transparent" />
      
      {/* Live indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-foreground">Live</span>
      </div>

      {/* Fallback button if iframe doesn't work well */}
      <button
        onClick={() => setShowIframe(false)}
        className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-xs text-foreground-muted hover:text-foreground transition-colors"
      >
        <ImageIcon className="w-3 h-3" />
        Show image
      </button>
    </div>
  );
}

// Carousel for project media (Website Preview / Images / Video)
function ProjectMediaCarousel({
  project,
  isHovered
}: {
  project: Project;
  isHovered: boolean;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasLiveUrl = !!project.live_url;
  const hasImage = !!project.image_url;
  const hasVideo = !!project.video_url;
  
  // Build slides array
  const slides: Array<{ type: 'website' | 'image' | 'video'; content: string }> = [];
  
  if (hasLiveUrl) {
    slides.push({ type: 'website', content: project.live_url! });
  }
  if (hasImage) {
    slides.push({ type: 'image', content: project.image_url! });
  }
  if (hasVideo) {
    slides.push({ type: 'video', content: project.video_url! });
  }

  // If no slides, show placeholder
  if (slides.length === 0) {
    return (
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
    );
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentMedia = slides[currentSlide];

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {currentMedia.type === 'website' && (
            <WebsitePreview
              url={currentMedia.content}
              fallbackImage={project.image_url}
              title={project.title}
            />
          )}
          {currentMedia.type === 'image' && (
            <motion.img
              src={currentMedia.content}
              alt={project.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
          {currentMedia.type === 'video' && (
            <video
              src={currentMedia.content}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay={isHovered}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - only show if multiple slides */}
      {slides.length > 1 && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Slide indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentSlide === index 
                    ? "bg-primary w-4" 
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Slide type indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-2 right-2 flex gap-1 z-10"
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                  currentSlide === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/60 backdrop-blur-sm text-foreground-muted hover:text-foreground"
                )}
              >
                {slide.type === 'website' && <Globe className="w-3 h-3" />}
                {slide.type === 'image' && <ImageIcon className="w-3 h-3" />}
                {slide.type === 'video' && <Play className="w-3 h-3" />}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
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
    <section id="projects" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.05 } : {}}
          transition={{ duration: 1 }}
          className="absolute top-1/4 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full bg-primary blur-3xl"
        />
      </div>

      <div className="section-container px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
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
                My Work
              </span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6"
            >
              Featured{" "}
              <span className="relative inline-block">
                <span className="gradient-text-accent">Projects</span>
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
              A selection of projects that showcase my skills and passion for development
            </motion.p>
          </div>

          {/* Projects Grid - Bento Style */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
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
