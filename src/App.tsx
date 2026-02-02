import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProfileAdmin from "./pages/admin/ProfileAdmin";
import ProjectsAdmin from "./pages/admin/ProjectsAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";
import SocialAdmin from "./pages/admin/SocialAdmin";
import TechStackAdmin from "./pages/admin/TechStackAdmin";
import TimelineAdmin from "./pages/admin/TimelineAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfileAdmin />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="tech-stack" element={<TechStackAdmin />} />
            <Route path="timeline" element={<TimelineAdmin />} />
            <Route path="social" element={<SocialAdmin />} />
            <Route path="messages" element={<MessagesAdmin />} />
            <Route path="analytics" element={<AnalyticsAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
