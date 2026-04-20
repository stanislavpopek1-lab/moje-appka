import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({ post, profile, currentUser, myProfile, onDelete, onLikeToggle, onRequireProfile }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const photo = profile?.photos?.[0];
  const isOwn = post.created_by === currentUser?.email;

  const toggleComments = async () => {
    if (!commentsLoaded) {
      const data = await base44.entities.PostComment.filter({ post_id: post.id }, "created_date");
      setComments(data);
      setCommentsLoaded(true);
    }
    setShowComments((v) => !v);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onRequireProfile && !onRequireProfile(true)) return;
    setSubmitting(true);
    const comment = await base44.entities.PostComment.create({ post_id: post.id, content: newComment.trim() });
    await base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
    setComments((c) => [...c, comment]);
    setNewComment("");
    setSubmitting(false);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {photo ? (
            <img src={photo} alt="" className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold leading-tight">{profile?.display_name || "Uživatel"}</p>
            <p className="text-[10px] text-muted-foreground tracking-wide">
              {post.created_date ? format(new Date(post.created_date), "d. MMM", { locale: cs }) : ""}
            </p>
          </div>
        </div>
        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl w-8 h-8 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10">
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Smazat příspěvek
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Media */}
      {post.media_url && post.media_type === "image" && (
        <img src={post.media_url} alt="" className="w-full max-h-96 object-cover" />
      )}
      {post.media_url && post.media_type === "video" && (
        <video src={post.media_url} controls className="w-full max-h-96" />
      )}

      {/* Caption */}
      {post.caption && (
        <p className="px-4 pt-3 pb-1 text-sm leading-relaxed text-foreground/90">{post.caption}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2.5">
        <button
          onClick={() => onLikeToggle(post)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
            post._liked
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Heart className={`w-4 h-4 ${post._liked ? "fill-primary" : ""}`} />
          <span>{post.likes_count || 0}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-white/5 px-4 py-3 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">Zatím žádné komentáře. Buď první!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                {c.created_by?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                <p className="text-[10px] font-semibold text-primary mb-0.5 tracking-wide">{c.created_by}</p>
                <p className="text-xs text-foreground/80">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2 pt-1">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={myProfile ? "Přidat komentář..." : "Nejprve si vytvoř profil"}
              disabled={!myProfile}
              className="rounded-xl text-xs h-8 bg-white/5 border-white/10 focus-visible:ring-primary/50"
            />
            <Button type="submit" size="icon" className="rounded-xl w-8 h-8 flex-shrink-0 bg-gradient-flame border-0" disabled={submitting || !newComment.trim() || !myProfile}>
              <Send className="w-3 h-3" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}