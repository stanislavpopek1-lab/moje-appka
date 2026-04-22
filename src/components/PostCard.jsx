import { useState } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

import { db, auth } from "@/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostCard({
  post,
  profile,
  myProfile,
  onDelete,
  onLikeToggle,
  onRequireProfile
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = auth.currentUser;

  const photo = profile?.photos?.[0];
  const isOwn = post.created_by === user?.email;

  // 🔥 LOAD COMMENTS (FIREBASE)
  const toggleComments = async () => {
    if (!commentsLoaded) {
      const q = query(
        collection(db, "PostComments"),
        where("post_id", "==", post.id)
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      setComments(data);
      setCommentsLoaded(true);
    }

    setShowComments((v) => !v);
  };

  // 🔥 ADD COMMENT
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onRequireProfile && !onRequireProfile(true)) return;

    setSubmitting(true);

    const commentRef = await addDoc(collection(db, "PostComments"), {
      post_id: post.id,
      content: newComment.trim(),
      created_by: user.email,
      created_date: new Date().toISOString()
    });

    await updateDoc(doc(db, "Posts", post.id), {
      comments_count: (post.comments_count || 0) + 1
    });

    setComments((c) => [
      ...c,
      {
        id: commentRef.id,
        post_id: post.id,
        content: newComment.trim(),
        created_by: user.email
      }
    ]);

    setNewComment("");
    setSubmitting(false);
  };

  // 🔥 DELETE POST
  const handleDelete = async () => {
    await deleteDoc(doc(db, "Posts", post.id));
    onDelete(post.id);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {photo ? (
            <img src={photo} className="w-9 h-9 rounded-xl object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}

          <div>
            <p className="text-sm font-semibold">
              {profile?.display_name || "Uživatel"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {post.created_date
                ? format(new Date(post.created_date), "d. MMM", { locale: cs })
                : ""}
            </p>
          </div>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Smazat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* MEDIA */}
      {post.media_url && post.media_type === "image" && (
        <img src={post.media_url} className="w-full max-h-96 object-cover" />
      )}

      {post.media_url && post.media_type === "video" && (
        <video src={post.media_url} controls className="w-full max-h-96" />
      )}

      {/* CAPTION */}
      {post.caption && (
        <p className="px-4 pt-3 text-sm">{post.caption}</p>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-2 px-3 py-2">

        <button
          onClick={() => onLikeToggle(post)}
          className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs"
        >
          <Heart className={`w-4 h-4 ${post._liked ? "fill-red-500" : ""}`} />
          {post.likes_count || 0}
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments_count || 0}
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="border-t px-4 py-3 space-y-3">

          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Žádné komentáře
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="text-xs bg-white/5 p-2 rounded-xl">
              <b>{c.created_by}</b>
              <p>{c.content}</p>
            </div>
          ))}

          <form onSubmit={submitComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Napiš komentář..."
              className="text-xs"
            />

            <Button type="submit" disabled={submitting}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}