-- Create enum for social link types
CREATE TYPE public.social_type AS ENUM ('instagram', 'email', 'github', 'linkedin', 'twitter', 'youtube', 'discord', 'website');

-- Create enum for app roles (admin only for now)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profile information table
CREATE TABLE public.profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Mohammad Nasrulloh',
    nickname TEXT DEFAULT 'Asrull',
    title TEXT DEFAULT 'Full-Stack Developer & Game Server Developer',
    education TEXT DEFAULT 'Computer Science Student – Semester 5',
    location TEXT DEFAULT 'Kebumen, Central Java – Indonesia',
    about TEXT DEFAULT 'Full-stack developer passionate about building scalable applications and managing Minecraft servers. Loves clean code, modern technologies, and seamless user experiences.',
    avatar_url TEXT,
    favicon_url TEXT,
    accent_color TEXT DEFAULT '#7F1D1D',
    seo_title TEXT DEFAULT 'Mohammad Nasrulloh | Full-Stack Developer',
    seo_description TEXT DEFAULT 'Full-stack developer passionate about building scalable applications and managing Minecraft servers.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social links table
CREATE TABLE public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type social_type NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tech stack categories
CREATE TABLE public.tech_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tech stack items
CREATE TABLE public.tech_stack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.tech_categories(id) ON DELETE SET NULL,
    icon_name TEXT,
    proficiency INTEGER DEFAULT 80,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    image_url TEXT,
    video_url TEXT,
    live_url TEXT,
    github_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experience & Education timeline
CREATE TABLE public.timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('experience', 'education')),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table for admin access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Visitor analytics (simple tracking)
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Public read policies (for portfolio viewing)
CREATE POLICY "Public can view profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Public can view social links" ON public.social_links FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view tech categories" ON public.tech_categories FOR SELECT USING (true);
CREATE POLICY "Public can view tech stack" ON public.tech_stack FOR SELECT USING (true);
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view timeline" ON public.timeline FOR SELECT USING (true);

-- Public can submit contact messages
CREATE POLICY "Public can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Public can log analytics
CREATE POLICY "Public can log analytics" ON public.analytics FOR INSERT WITH CHECK (true);

-- Admin policies (full access)
CREATE POLICY "Admins can manage profile" ON public.profile FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage social links" ON public.social_links FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tech categories" ON public.tech_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tech stack" ON public.tech_stack FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage timeline" ON public.timeline FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view analytics" ON public.analytics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default profile
INSERT INTO public.profile (name, nickname, title, education, location, about) VALUES (
    'Mohammad Nasrulloh',
    'Asrull',
    'Full-Stack Developer & Game Server Developer',
    'Computer Science Student – Semester 5',
    'Kebumen, Central Java – Indonesia',
    'Full-stack developer passionate about building scalable applications and managing Minecraft servers. Loves clean code, modern technologies, and seamless user experiences.'
);

-- Insert default social links
INSERT INTO public.social_links (type, url, label, sort_order) VALUES 
    ('instagram', 'https://instagram.com/asrull', 'Instagram', 1),
    ('email', 'mailto:contact@asrull.dev', 'Email', 2);

-- Insert tech categories
INSERT INTO public.tech_categories (name, sort_order) VALUES 
    ('Languages', 1),
    ('Frameworks', 2),
    ('Database & Cloud', 3),
    ('Tools', 4);

-- Insert tech stack
INSERT INTO public.tech_stack (name, category_id, icon_name, proficiency, is_featured, sort_order)
SELECT 'Java', id, 'java', 90, true, 1 FROM public.tech_categories WHERE name = 'Languages'
UNION ALL
SELECT 'JavaScript', id, 'javascript', 95, true, 2 FROM public.tech_categories WHERE name = 'Languages'
UNION ALL
SELECT 'TypeScript', id, 'typescript', 90, true, 3 FROM public.tech_categories WHERE name = 'Languages'
UNION ALL
SELECT 'PHP', id, 'php', 85, false, 4 FROM public.tech_categories WHERE name = 'Languages'
UNION ALL
SELECT 'Python', id, 'python', 80, false, 5 FROM public.tech_categories WHERE name = 'Languages'
UNION ALL
SELECT 'Dart', id, 'dart', 75, false, 6 FROM public.tech_categories WHERE name = 'Languages';

INSERT INTO public.tech_stack (name, category_id, icon_name, proficiency, is_featured, sort_order)
SELECT 'React', id, 'react', 95, true, 1 FROM public.tech_categories WHERE name = 'Frameworks'
UNION ALL
SELECT 'Laravel', id, 'laravel', 85, true, 2 FROM public.tech_categories WHERE name = 'Frameworks'
UNION ALL
SELECT 'CodeIgniter', id, 'codeigniter', 80, false, 3 FROM public.tech_categories WHERE name = 'Frameworks'
UNION ALL
SELECT 'Node.js', id, 'nodejs', 90, true, 4 FROM public.tech_categories WHERE name = 'Frameworks'
UNION ALL
SELECT 'Flutter', id, 'flutter', 75, false, 5 FROM public.tech_categories WHERE name = 'Frameworks';

INSERT INTO public.tech_stack (name, category_id, icon_name, proficiency, is_featured, sort_order)
SELECT 'MySQL', id, 'mysql', 90, true, 1 FROM public.tech_categories WHERE name = 'Database & Cloud'
UNION ALL
SELECT 'MongoDB', id, 'mongodb', 80, false, 2 FROM public.tech_categories WHERE name = 'Database & Cloud'
UNION ALL
SELECT 'AWS', id, 'aws', 75, false, 3 FROM public.tech_categories WHERE name = 'Database & Cloud'
UNION ALL
SELECT 'DigitalOcean', id, 'digitalocean', 85, true, 4 FROM public.tech_categories WHERE name = 'Database & Cloud'
UNION ALL
SELECT 'Azure', id, 'azure', 70, false, 5 FROM public.tech_categories WHERE name = 'Database & Cloud';

INSERT INTO public.tech_stack (name, category_id, icon_name, proficiency, is_featured, sort_order)
SELECT 'Git', id, 'git', 95, true, 1 FROM public.tech_categories WHERE name = 'Tools'
UNION ALL
SELECT 'Figma', id, 'figma', 80, false, 2 FROM public.tech_categories WHERE name = 'Tools';

-- Insert sample timeline
INSERT INTO public.timeline (type, title, organization, location, start_date, end_date, is_current, description, sort_order) VALUES 
    ('education', 'Bachelor of Computer Science', 'University of Technology', 'Indonesia', '2022-08-01', NULL, true, 'Currently pursuing a degree in Computer Science, focusing on software engineering and system design.', 1),
    ('experience', 'Game Server Developer', 'Freelance', 'Remote', '2020-01-01', NULL, true, 'Developing and managing custom Minecraft servers with unique gameplay features and optimized performance.', 2);