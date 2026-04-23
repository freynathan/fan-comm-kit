-- Bookmarks: a user can bookmark a post, synopsis, or news article
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  synopsis_id UUID NULL REFERENCES public.news_synopses(id) ON DELETE CASCADE,
  article_id UUID NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_one_target CHECK (
    (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN synopsis_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN article_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_post_uq ON public.bookmarks(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_syn_uq  ON public.bookmarks(user_id, synopsis_id) WHERE synopsis_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_art_uq  ON public.bookmarks(user_id, article_id) WHERE article_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON public.bookmarks(user_id, created_at DESC);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
ON public.bookmarks FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create own bookmarks"
ON public.bookmarks FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own bookmarks"
ON public.bookmarks FOR DELETE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments(post_id, created_at DESC);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly readable"
ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments as themselves"
ON public.post_comments FOR INSERT
WITH CHECK (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own comments"
ON public.post_comments FOR UPDATE
USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
USING (author_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep posts.comment_count in sync
CREATE OR REPLACE FUNCTION public.sync_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER post_comments_count_ins
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_post_comment_count();

CREATE TRIGGER post_comments_count_del
AFTER DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_post_comment_count();