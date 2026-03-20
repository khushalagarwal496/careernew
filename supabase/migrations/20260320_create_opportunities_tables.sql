-- Migration: Create Educational and Hackathon Tables

-- 1. Educational Opportunities (Swayam, NPTEL, Skill India)
CREATE TABLE IF NOT EXISTS public.educational_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    institute TEXT,
    duration TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    apply_link TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'Course',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.educational_opportunities ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the feed)
CREATE POLICY "Allow public read access for educational_opportunities"
ON public.educational_opportunities FOR SELECT
USING (true);

-- 2. Hackathons (Devpost)
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    themes TEXT[] DEFAULT '{}',
    prize_pool TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    apply_link TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for hackathons"
ON public.hackathons FOR SELECT
USING (true);

-- Add updated_at trigger for both (if needed, but for now we focus on injection)
