-- FULL CONSOLIDATED SUPABASE SETUP
-- Copy and run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Saved Analyses Table
CREATE TABLE IF NOT EXISTS public.saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT,
  domain TEXT,
  opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Applied Opportunities Table
CREATE TABLE IF NOT EXISTS public.applied_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id TEXT NOT NULL,
  opportunity_title TEXT NOT NULL,
  company TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  apply_link TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'offered', 'rejected', 'accepted')),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

-- 4. Educational Opportunities (Scraped)
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

-- 5. Hackathons (Scraped)
CREATE TABLE IF NOT EXISTS public.hackathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    themes TEXT[] DEFAULT '{}',
    prize_pool TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    apply_link TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

-- Policies for User Data (User-specific)
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own analyses" ON public.saved_analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own applications" ON public.applied_opportunities FOR ALL USING (auth.uid() = user_id);

-- Policies for Scraped Data (Public Read)
CREATE POLICY "Allow public read educational_opportunities" ON public.educational_opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public read hackathons" ON public.hackathons FOR SELECT USING (true);

-- Triggers for Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup existing trigger to avoid collision
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
