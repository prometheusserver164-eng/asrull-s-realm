-- Create security_events table to track suspicious activities
CREATE TABLE public.security_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'suspicious_activity', 'rate_limit', 'bot_detected', 'anomaly'
    severity TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    ip_address TEXT,
    user_agent TEXT,
    page TEXT,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
ON public.security_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update security events (mark as resolved)
CREATE POLICY "Admins can update security events"
ON public.security_events FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert security events (via edge function with service role)
CREATE POLICY "Service can insert security events"
ON public.security_events FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_is_resolved ON public.security_events(is_resolved);

-- Add columns to analytics for better tracking
ALTER TABLE public.analytics 
ADD COLUMN IF NOT EXISTS ip_hash TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;