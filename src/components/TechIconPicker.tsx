import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Available tech icons
const availableIcons = [
  { id: "java", name: "Java" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "php", name: "PHP" },
  { id: "python", name: "Python" },
  { id: "dart", name: "Dart" },
  { id: "react", name: "React" },
  { id: "laravel", name: "Laravel" },
  { id: "codeigniter", name: "CodeIgniter" },
  { id: "nodejs", name: "Node.js" },
  { id: "flutter", name: "Flutter" },
  { id: "mysql", name: "MySQL" },
  { id: "mongodb", name: "MongoDB" },
  { id: "aws", name: "AWS" },
  { id: "digitalocean", name: "DigitalOcean" },
  { id: "azure", name: "Azure" },
  { id: "git", name: "Git" },
  { id: "figma", name: "Figma" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
  { id: "vue", name: "Vue.js" },
  { id: "angular", name: "Angular" },
  { id: "nextjs", name: "Next.js" },
  { id: "tailwind", name: "Tailwind CSS" },
  { id: "docker", name: "Docker" },
  { id: "kubernetes", name: "Kubernetes" },
  { id: "redis", name: "Redis" },
  { id: "postgresql", name: "PostgreSQL" },
  { id: "firebase", name: "Firebase" },
  { id: "supabase", name: "Supabase" },
];

interface TechIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TechIconPicker({ value, onChange }: TechIconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = availableIcons.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="pl-9 bg-background border-border"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
        {filteredIcons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            onClick={() => onChange(icon.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-200",
              value === icon.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-card"
            )}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <TechIconPreview name={icon.id} />
            </div>
            <span className="text-xs text-foreground-secondary truncate w-full text-center">
              {icon.name}
            </span>
            {value === icon.id && (
              <Check className="absolute top-1 right-1 w-3 h-3 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Mini preview component
function TechIconPreview({ name }: { name: string }) {
  // Simplified SVG previews for picker
  const icons: Record<string, React.ReactNode> = {
    java: <div className="w-6 h-6 rounded bg-[#5382a1] flex items-center justify-center text-white text-xs font-bold">J</div>,
    javascript: <div className="w-6 h-6 rounded bg-[#f7df1e] flex items-center justify-center text-black text-xs font-bold">JS</div>,
    typescript: <div className="w-6 h-6 rounded bg-[#3178c6] flex items-center justify-center text-white text-xs font-bold">TS</div>,
    php: <div className="w-6 h-6 rounded bg-[#777bb4] flex items-center justify-center text-white text-xs font-bold">P</div>,
    python: <div className="w-6 h-6 rounded bg-gradient-to-br from-[#306998] to-[#ffd43b] flex items-center justify-center text-white text-xs font-bold">Py</div>,
    dart: <div className="w-6 h-6 rounded bg-[#0175c2] flex items-center justify-center text-white text-xs font-bold">D</div>,
    react: <div className="w-6 h-6 rounded bg-[#20232a] flex items-center justify-center text-[#61dafb] text-xs font-bold">R</div>,
    laravel: <div className="w-6 h-6 rounded bg-[#ff2d20] flex items-center justify-center text-white text-xs font-bold">L</div>,
    codeigniter: <div className="w-6 h-6 rounded bg-[#ee4323] flex items-center justify-center text-white text-xs font-bold">CI</div>,
    nodejs: <div className="w-6 h-6 rounded bg-[#339933] flex items-center justify-center text-white text-xs font-bold">N</div>,
    flutter: <div className="w-6 h-6 rounded bg-[#02569b] flex items-center justify-center text-[#54c5f8] text-xs font-bold">F</div>,
    mysql: <div className="w-6 h-6 rounded bg-[#00618a] flex items-center justify-center text-white text-xs font-bold">M</div>,
    mongodb: <div className="w-6 h-6 rounded bg-[#47a248] flex items-center justify-center text-white text-xs font-bold">Mo</div>,
    aws: <div className="w-6 h-6 rounded bg-[#232f3e] flex items-center justify-center text-[#ff9900] text-xs font-bold">A</div>,
    digitalocean: <div className="w-6 h-6 rounded bg-[#0080ff] flex items-center justify-center text-white text-xs font-bold">DO</div>,
    azure: <div className="w-6 h-6 rounded bg-[#0089d6] flex items-center justify-center text-white text-xs font-bold">Az</div>,
    git: <div className="w-6 h-6 rounded bg-[#f05032] flex items-center justify-center text-white text-xs font-bold">G</div>,
    figma: <div className="w-6 h-6 rounded bg-gradient-to-b from-[#f24e1e] via-[#a259ff] to-[#1abcfe] flex items-center justify-center text-white text-xs font-bold">F</div>,
    html: <div className="w-6 h-6 rounded bg-[#e34f26] flex items-center justify-center text-white text-xs font-bold">H</div>,
    css: <div className="w-6 h-6 rounded bg-[#1572b6] flex items-center justify-center text-white text-xs font-bold">C</div>,
    vue: <div className="w-6 h-6 rounded bg-[#42b883] flex items-center justify-center text-white text-xs font-bold">V</div>,
    angular: <div className="w-6 h-6 rounded bg-[#dd0031] flex items-center justify-center text-white text-xs font-bold">A</div>,
    nextjs: <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-white text-xs font-bold">N</div>,
    tailwind: <div className="w-6 h-6 rounded bg-[#06b6d4] flex items-center justify-center text-white text-xs font-bold">T</div>,
    docker: <div className="w-6 h-6 rounded bg-[#2496ed] flex items-center justify-center text-white text-xs font-bold">D</div>,
    kubernetes: <div className="w-6 h-6 rounded bg-[#326ce5] flex items-center justify-center text-white text-xs font-bold">K</div>,
    redis: <div className="w-6 h-6 rounded bg-[#dc382d] flex items-center justify-center text-white text-xs font-bold">R</div>,
    postgresql: <div className="w-6 h-6 rounded bg-[#336791] flex items-center justify-center text-white text-xs font-bold">PG</div>,
    firebase: <div className="w-6 h-6 rounded bg-[#ffca28] flex items-center justify-center text-black text-xs font-bold">F</div>,
    supabase: <div className="w-6 h-6 rounded bg-[#3ecf8e] flex items-center justify-center text-white text-xs font-bold">S</div>,
  };

  return icons[name] || <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-foreground-muted text-xs">?</div>;
}
