-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own videos"
  ON public.videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON public.videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = user_id);

-- Create video_formats table for different platform versions
CREATE TABLE public.video_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  format_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.video_formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view formats for their videos"
  ON public.video_formats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.videos
    WHERE videos.id = video_formats.video_id
    AND videos.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert formats for their videos"
  ON public.video_formats FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.videos
    WHERE videos.id = video_formats.video_id
    AND videos.user_id = auth.uid()
  ));

-- Create chatbot_settings table
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  personality TEXT NOT NULL DEFAULT 'friendly',
  auto_reply_enabled BOOLEAN NOT NULL DEFAULT true,
  response_delay INTEGER NOT NULL DEFAULT 0,
  custom_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatbot settings"
  ON public.chatbot_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatbot settings"
  ON public.chatbot_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot settings"
  ON public.chatbot_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create chatbot_activity table for logging responses
CREATE TABLE public.chatbot_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  message_type TEXT NOT NULL,
  original_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chatbot_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatbot activity"
  ON public.chatbot_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatbot activity"
  ON public.chatbot_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_settings_updated_at
  BEFORE UPDATE ON public.chatbot_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();