import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, X, Loader2, Sparkles, Plus, Lock } from "lucide-react";
import PostCard from "../components/PostCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [likes, setLikes] = useState(new Set());
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

  const ageRange = (() => {
    const saved = localStorage.getItem("flame-age-range");
    return saved ? JSON.parse(saved) : null;
  })();

  /* ========================= LOAD FEED ========================= */
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const user = auth.currentUser;

    // ✅ FIX: zabrání nekonečnému loadingu
    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUser(user);

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const postsSnap = await getDocs(postsQuery);
    const postsData = postsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const profilesSnap = await getDocs(collection(db, "users"));
    const profileMap = {};

    profilesSnap.docs.forEach((d) => {
      profileMap[d.data().email] = d.data();
    });

    const me = profilesSnap.docs.find(
      (d) => d.data().email === user.email
    )?.data();

    setMyProfile(me || null);
    setProfiles(profileMap);

    const likesSnap = await getDocs(
      query(collection(db, "likes"), where("user_email", "==", user.email))
    );

    const liked = new Set(likesSnap.docs.map((d) => d.data().post_id));

    setLikes(liked);
    setPosts(postsData.map((p) => ({ ...p, _liked: liked.has(p.id) })));
    setLoading(false);
  };

  /* ========================= UPLOAD MEDIA ========================= */
  const uploadMedia = async (file) => {
    const fileRef = ref(storage, `posts/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  /* ========================= CREATE POST ========================= */
  const handlePost = async () => {
    if (!myProfile) {
      toast.error("Nejprve si vytvoř profil!");
      return navigate("/profile/edit");
    }

    if (!caption.trim() && !mediaFile) {
      toast.error("Napiš něco nebo přidej media!");
      return;
    }

    setPosting(true);

    let mediaUrl = "";
    let type = "text";

    if (mediaFile) {
      mediaUrl = await uploadMedia(mediaFile);
      type = mediaType;
    }

    const docRef = await addDoc(collection(db, "posts"), {
      caption: caption.trim(),
      media_url: mediaUrl,
      media_type: type,
      likes_count: 0,
      comments_count: 0,
      createdBy: currentUser.email,
      createdAt: new Date(),
    });

    setPosts((prev) => [
      {
        id: docRef.id,
        caption,
        media_url: mediaUrl,
        media_type: type,
        likes_count: 0,
        comments_count: 0,
        createdBy: currentUser.email,
        _liked: false,
      },
      ...prev,
    ]);

    setCaption("");
    setMediaFile(null);
    setMediaPreview(null);
    setPosting(false);
    setComposing(false);

    toast.success("Příspěvek sdílen!");
  };

  /* ========================= LIKE ========================= */
  const handleLikeToggle = async (post) => {
    if (!myProfile) return navigate("/profile/edit");

    const isLiked = likes.has(post.id);
    const newLikes = new Set(likes);

    if (isLiked) {
      const q = query(
        collection(db, "likes"),
        where("post_id", "==", post.id),
        where("user_email", "==", currentUser.email)
      );

      const snap = await getDocs(q);
      snap.forEach(async (d) => await deleteDoc(d.ref));

      await updateDoc(doc(db, "posts", post.id), {
        likes_count: Math.max(0, (post.likes_count || 0) - 1),
      });

      newLikes.delete(post.id);
    } else {
      await addDoc(collection(db, "likes"), {
        post_id: post.id,
        user_email: currentUser.email,
      });

      await updateDoc(doc(db, "posts", post.id), {
        likes_count: (post.likes_count || 0) + 1,
      });

      newLikes.add(post.id);
    }

    setLikes(newLikes);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              _liked: !isLiked,
              likes_count: isLiked
                ? Math.max(0, (p.likes_count || 0) - 1)
                : (p.likes_count || 0) + 1,
            }
          : p
      )
    );
  };

  /* ========================= DELETE ========================= */
  const handleDelete = async (post) => {
    // ✅ FIX: jen autor může mazat
    if (post.createdBy !== currentUser.email) {
      toast.error("Nemůžeš smazat cizí příspěvek!");
      return;
    }

    await deleteDoc(doc(db, "posts", post.id));
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    toast.success("Smazáno");
  };

  /* ========================= FILTER ========================= */
  const filteredPosts = ageRange
    ? posts.filter((p) => {
        const prof = profiles[p.createdBy];
        if (!prof?.age) return true;
        return prof.age >= ageRange[0] && prof.age <= ageRange[1];
      })
    : posts;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );

  /* ========================= UI ========================= */
  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <button
          onClick={() => setComposing(true)}
          className="w-9 h-9 rounded-xl bg-gradient-flame flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {!myProfile && (
        <div className="glass p-4 rounded-2xl flex items-center gap-3">
          <Lock className="text-primary" />
          <div className="text-sm">Vytvoř profil pro postování</div>
        </div>
      )}

      {composing && (
        <div className="glass p-4 rounded-2xl space-y-3">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Co se děje?"
          />

          {mediaPreview && (
            <div className="relative">
              {mediaType === "image" ? (
                <img src={mediaPreview} />
              ) : (
                <video src={mediaPreview} controls />
              )}

              <button onClick={() => setMediaPreview(null)}>
                <X />
              </button>
            </div>
          )}

          <div className="flex justify-between">
            <input
              type="file"
              ref={fileRef}
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                setMediaFile(file);
                setMediaType(
                  file.type.startsWith("video") ? "video" : "image"
                );
                setMediaPreview(URL.createObjectURL(file));
              }}
            />

            <Button onClick={() => fileRef.current.click()}>Media</Button>

            <Button onClick={handlePost} disabled={posting}>
              {posting ? <Loader2 className="animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      )}

      {filteredPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          profile={profiles[post.createdBy]}
          currentUser={currentUser}
          myProfile={myProfile}
          onDelete={(post) => handleDelete(post)} // ✅ FIX
          onLikeToggle={handleLikeToggle}
        />
      ))}
    </div>
  );
}