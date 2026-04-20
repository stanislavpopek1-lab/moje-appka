import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, X, Loader2, Sparkles, Plus, Lock } from "lucide-react";
import PostCard from "../components/PostCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const [myProfile, setMyProfile] = useState(null);
  const [composing, setComposing] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  // Read age filter saved from Discover page
  const ageRange = (() => {
    const saved = localStorage.getItem("flame-age-range");
    return saved ? JSON.parse(saved) : null;
  })();

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
    const myProf = allProfiles.find((p) => p.created_by === user.email) || null;
    setMyProfile(myProf);
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

  const requireProfile = () => {
    if (!myProfile) {
      toast.error("Nejprve si vytvoř profil!");
      navigate("/profile/edit");
      return false;
    }
    return true;
  };

  const handlePost = async () => {
    if (!requireProfile()) return;
    if (!caption.trim() && !mediaFile) { toast.error("Napiš něco nebo přidej fotku/video!"); return; }
    setPosting(true);
    let mediaUrl = "", finalType = "text";
    if (mediaFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
      mediaUrl = file_url; finalType = mediaType;
    }
    const newPost = await base44.entities.Post.create({ caption: caption.trim(), media_url: mediaUrl, media_type: finalType, likes_count: 0, comments_count: 0 });
    setPosts((prev) => [{ ...newPost, _liked: false }, ...prev]);
    setCaption(""); clearMedia(); setPosting(false); setComposing(false);
    toast.success("Příspěvek sdílen!");
  };

  const handleLikeToggle = async (post) => {
    if (!requireProfile()) return;
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

  const handleComment = (requiresProfile) => {
    if (requiresProfile && !myProfile) {
      toast.error("Nejprve si vytvoř profil!");
      navigate("/profile/edit");
      return false;
    }
    return true;
  };

  // Filter posts by age range if set
  const filteredPosts = ageRange
    ? posts.filter((p) => {
        const prof = profiles[p.created_by];
        if (!prof?.age) return true; // keep posts where age is unknown
        return prof.age >= ageRange[0] && prof.age <= ageRange[1];
      })
    : posts;

  const myProfilePhoto = profiles[currentUser?.email]?.photos?.[0];

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            <span className="text-gradient">Feed</span>
          </h1>
          {ageRange && (
            <p className="text-[10px] text-muted-foreground tracking-wide mt-0.5">
              Filtr věku: {ageRange[0]}–{ageRange[1]} let
            </p>
          )}
        </div>
        <button
          onClick={() => { if (!requireProfile()) return; setComposing(true); }}
          className="w-9 h-9 rounded-xl bg-gradient-flame flex items-center justify-center glow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" style={{color: "hsl(35 25% 8%)"}} />
        </button>
      </div>

      {/* No profile banner */}
      {!myProfile && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3 border border-primary/20">
          <Lock className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Vytvoř si profil</p>
            <p className="text-xs text-muted-foreground">Pro lajkování, komentování a přidávání příspěvků potřebuješ profil.</p>
          </div>
          <button onClick={() => navigate("/profile/edit")}
            className="text-xs font-semibold text-primary hover:underline flex-shrink-0">
            Vytvořit
          </button>
        </div>
      )}

      {/* Compose panel */}
      {composing && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            {myProfilePhoto ? (
              <img src={myProfilePhoto} className="w-9 h-9 rounded-xl object-cover" alt="" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-sm font-semibold">{profiles[currentUser?.email]?.display_name || "Ty"}</span>
          </div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Sdílej něco s komunitou..."
            rows={3}
            className="resize-none border-0 bg-white/5 rounded-xl text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/50"
            autoFocus
          />
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden">
              {mediaType === "image"
                ? <img src={mediaPreview} alt="" className="w-full max-h-56 object-cover" />
                : <video src={mediaPreview} controls className="w-full max-h-56" />}
              <button onClick={clearMedia} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs font-medium transition-colors">
                <Image className="w-3.5 h-3.5" /> Foto
              </button>
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 text-xs font-medium transition-colors">
                <Video className="w-3.5 h-3.5" /> Video
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground h-8" onClick={() => { setComposing(false); setCaption(""); clearMedia(); }}>
                Zrušit
              </Button>
              <Button
                onClick={handlePost}
                disabled={posting || (!caption.trim() && !mediaFile)}
                size="sm"
                className="rounded-xl h-8 px-5 bg-gradient-flame border-0 hover:opacity-90 text-xs font-semibold"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sdílet"}
              </Button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {ageRange ? "Žádné příspěvky pro tento věkový filtr." : "Zatím žádné příspěvky. Buď první!"}
          </p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            profile={profiles[post.created_by]}
            currentUser={currentUser}
            myProfile={myProfile}
            onDelete={handleDelete}
            onLikeToggle={handleLikeToggle}
            onRequireProfile={handleComment}
          />
        ))
      )}
    </div>
  );
}