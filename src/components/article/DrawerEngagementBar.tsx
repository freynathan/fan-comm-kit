import { useEffect, useState } from "react";
import { Heart, MessageCircle, Bookmark, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  author: { username: string; display_name: string | null; initials: string; avatar_url: string | null } | null;
}

interface Props {
  postId: string | null | undefined;
  synopsisId: string | null | undefined;
  articleId: string | null | undefined;
  initialLoveCount: number;
  initialCommentCount: number;
  accent: string;
}

export function DrawerEngagementBar({
  postId,
  synopsisId,
  articleId,
  initialLoveCount,
  initialCommentCount,
  accent,
}: Props) {
  const { user } = useSupabaseAuth();
  const [loveCount, setLoveCount] = useState(initialLoveCount);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentRow[] | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load bookmark state for current user
  useEffect(() => {
    if (!user?.dbUserId) {
      setBookmarked(false);
      setBookmarkId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      let q = supabase.from("bookmarks").select("id").eq("user_id", user.dbUserId);
      if (postId) q = q.eq("post_id", postId);
      else if (synopsisId) q = q.eq("synopsis_id", synopsisId);
      else if (articleId) q = q.eq("article_id", articleId);
      else return;
      const { data } = await q.maybeSingle();
      if (cancelled) return;
      if (data) {
        setBookmarked(true);
        setBookmarkId(data.id);
      } else {
        setBookmarked(false);
        setBookmarkId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.dbUserId, postId, synopsisId, articleId]);

  const onLove = async () => {
    if (!postId) {
      toast.info("Loves are tracked once this is published as a post.");
      return;
    }
    const next = loveCount + 1;
    setLoveCount(next);
    const { error } = await supabase
      .from("posts")
      .update({ love_count: next })
      .eq("id", postId);
    if (error) {
      setLoveCount(loveCount);
      toast.error("Could not record love");
    }
  };

  const onBookmark = async () => {
    if (!user?.dbUserId) {
      toast.error("Sign in to bookmark");
      return;
    }
    if (bookmarked && bookmarkId) {
      const prev = { bookmarked, bookmarkId };
      setBookmarked(false);
      setBookmarkId(null);
      const { error } = await supabase.from("bookmarks").delete().eq("id", prev.bookmarkId);
      if (error) {
        setBookmarked(true);
        setBookmarkId(prev.bookmarkId);
        toast.error("Could not remove bookmark");
      }
    } else {
      const payload: {
        user_id: string;
        post_id?: string;
        synopsis_id?: string;
        article_id?: string;
      } = { user_id: user.dbUserId };
      if (postId) payload.post_id = postId;
      else if (synopsisId) payload.synopsis_id = synopsisId;
      else if (articleId) payload.article_id = articleId;
      else {
        toast.error("Nothing to bookmark");
        return;
      }
      const { data, error } = await supabase
        .from("bookmarks")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        toast.error("Could not bookmark");
        return;
      }
      setBookmarked(true);
      setBookmarkId(data.id);
      toast.success("Bookmarked");
    }
  };

  const loadComments = async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from("post_comments")
      .select("id, content, created_at, author:users!post_comments_author_id_fkey(username, display_name, initials, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast.error("Could not load comments");
      return;
    }
    setComments((data ?? []) as unknown as CommentRow[]);
  };

  const onCommentToggle = async () => {
    if (!postId) {
      toast.info("Comments open once this is published as a post.");
      return;
    }
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) await loadComments();
  };

  const onSubmitComment = async () => {
    if (!user?.dbUserId || !postId) return;
    const content = draft.trim();
    if (!content) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, author_id: user.dbUserId, content });
    setSubmitting(false);
    if (error) {
      toast.error("Could not post comment");
      return;
    }
    setDraft("");
    setCommentCount((c) => c + 1);
    await loadComments();
  };

  return (
    <div>
      {showComments && postId && (
        <div
          className="max-w-[720px] mx-auto px-5 md:px-8 py-4"
          style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
        >
          {user?.dbUserId ? (
            <div className="flex items-start gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                className="flex-1 text-[13px] leading-[1.5] text-[#0A1628] placeholder:text-ds-text-tertiary bg-[#FAFAFA] rounded-lg px-3 py-2 resize-none outline-none focus:ring-1"
                style={{
                  border: "0.5px solid hsl(var(--color-border))",
                }}
              />
              <button
                onClick={onSubmitComment}
                disabled={submitting || !draft.trim()}
                aria-label="Post comment"
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40"
                style={{ backgroundColor: accent }}
              >
                <Send size={14} strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <p className="text-[12px] text-ds-text-tertiary">Sign in to comment.</p>
          )}

          <div className="mt-3 space-y-3">
            {comments === null ? (
              <p className="text-[12px] text-ds-text-tertiary">Loading…</p>
            ) : comments.length === 0 ? (
              <p className="text-[12px] text-ds-text-tertiary">Be the first to comment.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0 overflow-hidden"
                    style={{ backgroundColor: accent }}
                  >
                    {c.author?.avatar_url ? (
                      <img src={c.author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      c.author?.initials || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-ds-text-secondary">
                      <span className="font-medium text-[#0A1628]">
                        {c.author?.display_name || `@${c.author?.username || "user"}`}
                      </span>
                      <span className="text-ds-text-tertiary"> · {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-[#0A1628] whitespace-pre-wrap break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <footer
        className="shrink-0"
        style={{ borderTop: "0.5px solid hsl(var(--color-border))" }}
      >
        <div className="max-w-[720px] mx-auto flex items-center gap-4 px-5 md:px-8 h-14">
          <button
            onClick={onLove}
            className="flex items-center gap-1.5 text-[13px] text-ds-text-secondary hover:text-[#CF3B12] transition-colors"
          >
            <Heart size={16} strokeWidth={1.75} />
            {loveCount}
          </button>
          <button
            onClick={onCommentToggle}
            aria-expanded={showComments}
            className={`flex items-center gap-1.5 text-[13px] transition-colors ${
              showComments ? "text-[#0C447C]" : "text-ds-text-secondary hover:text-[#0C447C]"
            }`}
          >
            <MessageCircle size={16} strokeWidth={1.75} />
            {commentCount}
          </button>
          <button
            onClick={onBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
            className={`ml-auto flex items-center gap-1.5 text-[13px] transition-colors ${
              bookmarked ? "" : "text-ds-text-secondary hover:text-[#0A1628]"
            }`}
            style={bookmarked ? { color: accent } : undefined}
          >
            <Bookmark size={16} strokeWidth={1.75} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </footer>
    </div>
  );
}
