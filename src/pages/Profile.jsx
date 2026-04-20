import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PhotoGallery from "../components/PhotoGallery";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MapPin, User, Heart, Zap, Sparkles } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, matches: 0 });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length > 0) setProfile(profiles[0]);
    const likes = await base44.entities.Like.filter({ from_user: user.email, type: "like" });
    const matches = await base44.entities.Match.list();
    const myMatches = matches.filter((m) => (m.user1 === user.email || m.user2 === user.email) && m.status === "active");
    setStats({ likes: likes.length, matches: myMatches.length });
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-flame flex items-center justify-center mb-8 animate-pulse-glow">
        <Sparkles className="w-12 h-12" style={{color: "hsl(35 25% 8%)"}} />
      </div>
      <h1 className="text-3xl font-heading font-bold mb-3">Zatím žádný profil</h1>
      <p className="text-muted-foreground mb-8 max-w-xs leading-relaxed">Nastav si profil a najdi své zlatíčko!</p>
      <Button onClick={() => navigate("/profile/edit")} className="rounded-2xl px-10 h-12 bg-gradient-flame border-0 font-semibold hover:opacity-90" style={{color: "hsl(35 25% 8%)"}}>
        Vytvořit profil
      </Button>
    </div>
  );

  const mainPhoto = profile.photos?.[0] || null;

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      {/* Hero photo */}
      <div className="relative h-[420px] overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt=""
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <User className="w-24 h-24 text-muted-foreground/20" />
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Edit button */}
        <button
          onClick={() => navigate("/profile/edit")}
          className="absolute top-5 right-5 glass-strong rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold tracking-wide hover:bg-white/10 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" /> Upravit
        </button>
      </div>

      {/* Content */}
      <div className="px-5 -mt-16 relative z-10 pb-10">
        {/* Name & location */}
        <div className="mb-5">
          <h1 className="text-4xl font-heading font-bold tracking-tight">
            {profile.display_name}
            <span className="text-2xl font-light text-muted-foreground ml-2">{profile.age}</span>
          </h1>
          {profile.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1.5 tracking-widest uppercase font-medium">
              <MapPin className="w-3 h-3" /> {profile.location}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-2xl font-heading font-bold text-gradient">{stats.likes}</span>
            </div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Lajky</div>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-2xl font-heading font-bold text-gradient">{stats.matches}</span>
            </div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Shody</div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">O mně</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Zájmy</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium"
                  style={{ background: "rgba(218,165,32,0.12)", border: "1px solid rgba(218,165,32,0.25)", color: "hsl(42 90% 60%)" }}
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Photo grid */}
        {profile.photos?.length > 1 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Fotky</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => { setGalleryIndex(i); setGalleryOpen(true); }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {galleryOpen && profile.photos?.length > 0 && (
          <PhotoGallery photos={profile.photos} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}