import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({ post, profile, currentUser, onDelete, onLikeToggle }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const photo = profile?.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";
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
    setSubmitting(true);
    const comment = await base44.entities.PostComment.create({
      post_id: post.id,
      content: newComment.trim(),
    });
    await base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
    setComments((c) => [...c, comment]);
    setNewComment("");
    setSubmitting(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-primary/20" />
          <div>
            <p className="text-sm font-semibold leading-tight">{profile?.display_name || "User"}</p>
            <p className="text-[10px] text-muted-foreground">
              {post.created_date ? format(new Date(post.created_date), "MMM d") : ""}
            </p>
          </div>
        </div>
        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive">
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
        <p className="px-4 pt-3 pb-1 text-sm leading-relaxed">{post.caption}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLikeToggle(post)}
          className={`rounded-full gap-1.5 ${post._liked ? "text-primary" : "text-muted-foreground"}`}
        >
          <Heart className={`w-4 h-4 ${post._liked ? "fill-primary" : ""}`} />
          <span className="text-xs">{post.likes_count || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          className="rounded-full gap-1.5 text-muted-foreground"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{post.comments_count || 0}</span>
        </Button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">Zatím žádné komentáře. Buď první!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                {c.created_by?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 bg-muted rounded-xl px-3 py-2">
                <p className="text-[10px] font-semibold text-primary mb-0.5">{c.created_by}</p>
                <p className="text-xs">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2 pt-1">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Napsat komentář..."
              className="rounded-full text-xs h-8 bg-muted border-0"
            />
            <Button type="submit" size="icon" className="rounded-full w-8 h-8 flex-shrink-0" disabled={submitting || !newComment.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}