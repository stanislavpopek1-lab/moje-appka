import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, X, Loader2, Flame } from "lucide-react";
import PostCard from "../components/PostCard";
import { toast } from "sonner";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [myLikes, setMyLikes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("text");
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const [allPosts, allProfiles, likes] = await Promise.all([
      base44.entities.Post.list("-created_date", 50),
      base44.entities.UserProfile.list(),
      base44.entities.PostLike.filter({ user_email: user.email }),
    ]);
    const profileMap = {};
    allProfiles.forEach((p) => { profileMap[p.created_by] = p; });
    setProfiles(profileMap);
    const likedPostIds = new Set(likes.map((l) => l.post_id));
    setMyLikes(likedPostIds);
    setPosts(allPosts.map((p) => ({ ...p, _liked: likedPostIds.has(p.id) })));
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType("text");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePost = async () => {
    if (!caption.trim() && !mediaFile) { toast.error("Napiš něco nebo přidej foto/video!"); return; }
    setPosting(true);
    let mediaUrl = "", finalType = "text";
    if (mediaFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
      mediaUrl = file_url; finalType = mediaType;
    }
    const newPost = await base44.entities.Post.create({ caption: caption.trim(), media_url: mediaUrl, media_type: finalType, likes_count: 0, comments_count: 0 });
    setPosts((prev) => [{ ...newPost, _liked: false }, ...prev]);
    setCaption(""); clearMedia(); setPosting(false);
    toast.success("Příspěvek přidán!");
  };

  const handleLikeToggle = async (post) => {
    const isLiked = myLikes.has(post.id);
    const newLikes = new Set(myLikes);
    if (isLiked) {
      const existingLikes = await base44.entities.PostLike.filter({ post_id: post.id, user_email: currentUser.email });
      for (const l of existingLikes) await base44.entities.PostLike.delete(l.id);
      await base44.entities.Post.update(post.id, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
      newLikes.delete(post.id);
    } else {
      await base44.entities.PostLike.create({ post_id: post.id, user_email: currentUser.email });
      await base44.entities.Post.update(post.id, { likes_count: (post.likes_count || 0) + 1 });
      newLikes.add(post.id);
    }
    setMyLikes(newLikes);
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _liked: !isLiked, likes_count: isLiked ? Math.max(0, (p.likes_count || 0) - 1) : (p.likes_count || 0) + 1 } : p));
  };

  const handleDelete = async (postId) => {
    await base44.entities.Post.delete(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Příspěvek smazán");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
        <Flame className="w-6 h-6 text-primary" /> Příspěvky
      </h1>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <img src={profiles[currentUser?.email]?.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Sdílej něco s komunitou..." rows={2} className="resize-none border-0 bg-muted rounded-xl text-sm" />
        </div>
        {mediaPreview && (
          <div className="relative rounded-xl overflow-hidden">
            {mediaType === "image" ? <img src={mediaPreview} alt="" className="w-full max-h-60 object-cover" /> : <video src={mediaPreview} controls className="w-full max-h-60" />}
            <button onClick={clearMedia} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground gap-1.5" onClick={() => fileRef.current?.click()}>
              <Image className="w-4 h-4" /><span className="text-xs">Foto</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground gap-1.5" onClick={() => fileRef.current?.click()}>
              <Video className="w-4 h-4" /><span className="text-xs">Video</span>
            </Button>
          </div>
          <Button onClick={handlePost} disabled={posting || (!caption.trim() && !mediaFile)} size="sm" className="rounded-full px-5">
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sdílet"}
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Zatím žádné příspěvky. Buď první!</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} profile={profiles[post.created_by]} currentUser={currentUser} onDelete={handleDelete} onLikeToggle={handleLikeToggle} />
        ))
      )}
    </div>
  );
}