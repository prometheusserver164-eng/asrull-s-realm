-- Fix RLS policies for sensitive tables

-- 1. Fix analytics table - restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.analytics;
CREATE POLICY "Only admins can view analytics" 
ON public.analytics 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix security_events table - restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view security events" ON public.security_events;
CREATE POLICY "Only admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix contact_messages table - restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix user_roles table - restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;
CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));