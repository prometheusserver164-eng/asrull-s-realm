import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Indonesian translations - accurate and natural
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    "nav.about": "Tentang",
    "nav.tech_stack": "Teknologi",
    "nav.projects": "Proyek",
    "nav.experience": "Pengalaman",
    "nav.contact": "Kontak",
    "nav.admin": "Admin",
    
    // Hero
    "hero.greeting": "Halo, saya",
    "hero.scroll": "Gulir",
    "hero.view_projects": "Lihat Proyek",
    "hero.contact_me": "Hubungi Saya",
    
    // About
    "about.label": "Tentang Saya",
    "about.title_1": "Mengubah Ide Menjadi",
    "about.title_2": "Kenyataan",
    "about.who_i_am": "Siapa Saya",
    "about.who_i_am_desc": "Pengembang yang bersemangat dari Indonesia, saat ini menempuh pendidikan Ilmu Komputer sambil membangun aplikasi nyata.",
    "about.what_i_build": "Apa yang Saya Bangun",
    "about.what_i_build_desc": "Aplikasi web full-stack, backend game server, dan sistem yang skalabel menggunakan teknologi modern.",
    "about.what_drives_me": "Motivasi Saya",
    "about.what_drives_me_desc": "Kode yang bersih, solusi elegan, mempelajari teknologi baru, dan menciptakan pengalaman pengguna yang mulus.",
    "about.years_exp": "Tahun Pengalaman",
    "about.projects_done": "Proyek Selesai",
    "about.technologies": "Teknologi",
    "about.lines_of_code": "Baris Kode",
    
    // Tech Stack
    "tech.label": "Tech Stack",
    "tech.title": "Keahlian & Teknologi",
    "tech.subtitle": "Tools dan teknologi yang saya gunakan untuk mewujudkan ide",
    "tech.all": "Semua",
    "tech.technologies": "Teknologi",
    "tech.categories": "Kategori",
    "tech.featured": "Unggulan",
    "tech.avg_proficiency": "Rata-rata Keahlian",
    
    // Projects
    "projects.label": "Proyek Saya",
    "projects.title": "Karya Terbaru",
    "projects.subtitle": "Beberapa proyek yang telah saya kerjakan",
    "projects.view_all": "Lihat Semua",
    "projects.live": "Demo",
    "projects.code": "Kode",
    "projects.featured": "Unggulan",
    "projects.no_preview": "Tidak ada pratinjau",
    "projects.live_indicator": "Live",
    "projects.show_image": "Tampilkan gambar",
    "projects.loading": "Memuat pratinjau...",
    "projects.view_live": "Lihat Demo",
    "projects.view_code": "Lihat Kode",
    
    // Timeline
    "timeline.label": "Perjalanan",
    "timeline.title_1": "Pengalaman &",
    "timeline.title_2": "Pendidikan",
    "timeline.subtitle": "Perjalanan profesional dan latar belakang akademis saya",
    "timeline.present": "Sekarang",
    "timeline.achievement": "Pencapaian",
    
    // Contact
    "contact.label": "Hubungi Saya",
    "contact.title": "Mari Bekerja Sama",
    "contact.subtitle": "Punya proyek? Mari diskusikan bagaimana kita bisa mewujudkan ide Anda.",
    "contact.connect": "Terhubung Dengan Saya",
    "contact.copy_email": "Salin Alamat Email",
    "contact.copied": "Tersalin!",
    "contact.name": "Nama",
    "contact.name_placeholder": "Nama Anda",
    "contact.email": "Email",
    "contact.email_placeholder": "email@anda.com",
    "contact.message": "Pesan",
    "contact.message_placeholder": "Ceritakan tentang proyek Anda...",
    "contact.send": "Kirim Pesan",
    "contact.sending": "Mengirim...",
    "contact.success": "Pesan berhasil dikirim! Saya akan segera menghubungi Anda.",
    "contact.error": "Gagal mengirim pesan. Silakan coba lagi.",
    
    // Footer
    "footer.crafted_by": "Dibuat oleh",
    "footer.rights": "Hak cipta dilindungi.",
    
    // Common
    "common.loading": "Memuat...",
    "common.error": "Terjadi kesalahan",
  },
  en: {
    // Navigation
    "nav.about": "About",
    "nav.tech_stack": "Tech Stack",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    
    // Hero
    "hero.greeting": "Hello, I'm",
    "hero.scroll": "Scroll",
    "hero.view_projects": "View Projects",
    "hero.contact_me": "Contact Me",
    
    // About
    "about.label": "About Me",
    "about.title_1": "Turning Ideas Into",
    "about.title_2": "Reality",
    "about.who_i_am": "Who I Am",
    "about.who_i_am_desc": "A passionate developer from Indonesia, currently pursuing Computer Science while building real-world applications.",
    "about.what_i_build": "What I Build",
    "about.what_i_build_desc": "Full-stack web applications, game server backends, and scalable systems using modern technologies.",
    "about.what_drives_me": "What Drives Me",
    "about.what_drives_me_desc": "Clean code, elegant solutions, learning new technologies, and creating seamless user experiences.",
    "about.years_exp": "Years Experience",
    "about.projects_done": "Projects Completed",
    "about.technologies": "Technologies",
    "about.lines_of_code": "Lines of Code",
    
    // Tech Stack
    "tech.label": "Tech Stack",
    "tech.title": "Skills & Technologies",
    "tech.subtitle": "Tools and technologies I use to bring ideas to life",
    "tech.all": "All",
    "tech.technologies": "Technologies",
    "tech.categories": "Categories",
    "tech.featured": "Featured",
    "tech.avg_proficiency": "Avg. Proficiency",
    
    // Projects
    "projects.label": "My Work",
    "projects.title": "Featured Projects",
    "projects.subtitle": "Some of the projects I've worked on",
    "projects.view_all": "View All",
    "projects.live": "Live",
    "projects.code": "Code",
    "projects.featured": "Featured",
    "projects.no_preview": "No preview",
    "projects.live_indicator": "Live",
    "projects.show_image": "Show image",
    "projects.loading": "Loading preview...",
    "projects.view_live": "View Live",
    "projects.view_code": "View Code",
    
    // Timeline
    "timeline.label": "Journey",
    "timeline.title_1": "Experience &",
    "timeline.title_2": "Education",
    "timeline.subtitle": "My professional journey and academic background",
    "timeline.present": "Present",
    "timeline.achievement": "Achievement",
    
    // Contact
    "contact.label": "Get in Touch",
    "contact.title": "Let's Work Together",
    "contact.subtitle": "Have a project in mind? Let's discuss how we can bring your ideas to life.",
    "contact.connect": "Connect With Me",
    "contact.copy_email": "Copy Email Address",
    "contact.copied": "Copied!",
    "contact.name": "Name",
    "contact.name_placeholder": "Your name",
    "contact.email": "Email",
    "contact.email_placeholder": "your@email.com",
    "contact.message": "Message",
    "contact.message_placeholder": "Tell me about your project...",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "contact.success": "Message sent successfully! I'll get back to you soon.",
    "contact.error": "Failed to send message. Please try again.",
    
    // Footer
    "footer.crafted_by": "Crafted by",
    "footer.rights": "All rights reserved.",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("portfolio-language");
    return (saved as Language) || "id";
  });

  useEffect(() => {
    localStorage.setItem("portfolio-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
