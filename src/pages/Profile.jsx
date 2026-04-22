import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PhotoGallery from "../components/PhotoGallery";

import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, User, Heart, Zap, Sparkles } from "lucide-react";

export default function Profile() {
  const { email } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, matches: 0 });

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    loadProfile();
  }, [email]);

  const loadProfile = async () => {
    if (!email) return;

    setLoading(true);

    try {
      const decodedEmail = decodeURIComponent(email);

      // 🔥 FIRESTORE QUERY (FIX)
      const q = query(
        collection(db, "users"),
        where("email", "==", decodedEmail)
      );

      const snap = await getDocs(q);

      const found = snap.docs[0]?.data() || null;
      setProfile(found);

      if (!found) {
        setLoading(false);
        return;
      }

      // 🔥 LIKES
      const likeSnap = await getDocs(
        query(
          collection(db, "likes"),
          where("to_user", "==", found.uid)
        )
      );

      // 🔥 MATCHES
      const matchSnap = await getDocs(collection(db, "matches"));

      const myMatches = matchSnap.docs
        .map((d) => d.data())
        .filter(
          (m) =>
            (m.user1 === found.uid || m.user2 === found.uid) &&
            m.status === "active"
        );

      setStats({
        likes: likeSnap.size,
        matches: myMatches.length,
      });
    } catch (err) {
      console.error("Profile load error:", err);
      setProfile(null);
    }

    setLoading(false);
  };

  /* =========================
     LOADING
  ========================= */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );

  /* =========================
     NOT FOUND
  ========================= */
  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-flame flex items-center justify-center mb-8 animate-pulse-glow">
          <Sparkles className="w-12 h-12" />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Profil nenalezen
        </h1>

        <Button onClick={() => navigate("/")}>
          Zpět
        </Button>
      </div>
    );

  const isMe = auth.currentUser?.email === profile.email;
  const mainPhoto = profile.photos?.[0] || null;

  return (
    <div className="min-h-screen max-w-lg mx-auto">

      {/* HERO */}
      <div className="relative h-[420px] overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              setGalleryIndex(0);
              setGalleryOpen(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <User className="w-24 h-24 text-muted-foreground/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {isMe && (
          <button
            onClick={() => navigate("/profile/edit")}
            className="absolute top-5 right-5 glass-strong rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold"
          >
            <Edit className="w-3.5 h-3.5" /> Upravit
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-5 -mt-16 relative z-10 pb-10">

        {/* NAME */}
        <div className="mb-5">
          <h1 className="text-4xl font-bold">
            {profile.display_name}
            <span className="text-2xl font-light text-muted-foreground ml-2">
              {profile.age}
            </span>
          </h1>

          {profile.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1.5 uppercase">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 text-center">
            <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.likes}</div>
            <div className="text-[10px] uppercase text-muted-foreground">
              Lajky
            </div>
          </div>

          <div className="glass rounded-2xl p-4 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.matches}</div>
            <div className="text-[10px] uppercase text-muted-foreground">
              Shody
            </div>
          </div>
        </div>

        {/* BIO */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-muted-foreground mb-2">
              O mně
            </h3>
            <p className="text-sm">{profile.bio}</p>
          </div>
        )}

        {/* INTERESTS */}
        {profile.interests?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-muted-foreground mb-3">
              Zájmy
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(218,165,32,0.12)",
                    border: "1px solid rgba(218,165,32,0.25)",
                  }}
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PHOTOS */}
        {profile.photos?.length > 1 && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-muted-foreground mb-3">
              Fotky
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => {
                    setGalleryIndex(i);
                    setGalleryOpen(true);
                  }}
                >
                  <img src={url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GALLERY */}
      <AnimatePresence>
        {galleryOpen && profile.photos?.length > 0 && (
          <PhotoGallery
            photos={profile.photos}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}