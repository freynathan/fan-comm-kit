-- POSTS
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  entity_page_id UUID,
  content TEXT,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  love_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  content_type TEXT NOT NULL DEFAULT 'post',
  embed_url TEXT,
  embed_platform TEXT,
  embed_thumbnail TEXT,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are publicly readable"
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE INDEX idx_posts_site_id ON public.posts(site_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- NEWS SOURCES
CREATE TABLE public.news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'rss',
  reliability_score NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News sources are publicly readable"
  ON public.news_sources FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create news sources"
  ON public.news_sources FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update news sources"
  ON public.news_sources FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete news sources"
  ON public.news_sources FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_news_sources_site_id ON public.news_sources(site_id);
CREATE INDEX idx_news_sources_is_active ON public.news_sources(is_active);

-- NEWS ARTICLES
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  source_id UUID REFERENCES public.news_sources(id) ON DELETE SET NULL,
  original_url TEXT NOT NULL,
  original_title TEXT NOT NULL,
  original_author TEXT,
  original_published_at TIMESTAMPTZ,
  original_content TEXT,
  relevance_score NUMERIC NOT NULL DEFAULT 0,
  quality_score NUMERIC NOT NULL DEFAULT 0,
  is_duplicate BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News articles are publicly readable"
  ON public.news_articles FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create news articles"
  ON public.news_articles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update news articles"
  ON public.news_articles FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete news articles"
  ON public.news_articles FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_news_articles_site_id ON public.news_articles(site_id);
CREATE INDEX idx_news_articles_source_id ON public.news_articles(source_id);
CREATE INDEX idx_news_articles_status ON public.news_articles(status);
CREATE INDEX idx_news_articles_created_at ON public.news_articles(created_at DESC);

-- NEWS SYNOPSES
CREATE TABLE public.news_synopses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  synopsis_content TEXT NOT NULL,
  key_points JSONB,
  fan_angle TEXT,
  reading_time_seconds INTEGER NOT NULL DEFAULT 0,
  entity_page_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_synopses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News synopses are publicly readable"
  ON public.news_synopses FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create news synopses"
  ON public.news_synopses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update news synopses"
  ON public.news_synopses FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete news synopses"
  ON public.news_synopses FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_news_synopses_article_id ON public.news_synopses(article_id);
CREATE INDEX idx_news_synopses_site_id ON public.news_synopses(site_id);
CREATE INDEX idx_news_synopses_post_id ON public.news_synopses(post_id);
CREATE INDEX idx_news_synopses_created_at ON public.news_synopses(created_at DESC);

-- CONTENT DISPATCHES
CREATE TABLE public.content_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  synopsis_id UUID REFERENCES public.news_synopses(id) ON DELETE CASCADE,
  source_site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  dispatched_to_site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  dispatch_reason TEXT,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content dispatches are publicly readable"
  ON public.content_dispatches FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create dispatches"
  ON public.content_dispatches FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dispatches"
  ON public.content_dispatches FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dispatches"
  ON public.content_dispatches FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_content_dispatches_article_id ON public.content_dispatches(article_id);
CREATE INDEX idx_content_dispatches_synopsis_id ON public.content_dispatches(synopsis_id);
CREATE INDEX idx_content_dispatches_dispatched_to_site_id ON public.content_dispatches(dispatched_to_site_id);
CREATE INDEX idx_content_dispatches_dispatched_at ON public.content_dispatches(dispatched_at DESC);