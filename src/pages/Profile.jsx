import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import PhotoGallery from "../components/PhotoGallery";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, LogOut, MapPin } from "lucide-react";

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
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-2xl font-heading font-bold mb-3">Zatím žádný profil</h1>
      <p className="text-muted-foreground mb-6">Nastavte si profil a začněte!</p>
      <Button onClick={() => navigate("/profile/edit")} className="rounded-full px-8">Vytvořit profil</Button>
    </div>
  );

  const mainPhoto = profile.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=500&fit=crop";

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      <div className="relative h-80 overflow-hidden">
        <img
          src={mainPhoto}
          alt=""
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" onClick={() => base44.auth.logout()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">{profile.display_name}, {profile.age}</h1>
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />{profile.location}
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/profile/edit")} size="sm" variant="outline" className="rounded-full">
            <Edit className="w-3.5 h-3.5 mr-1" />Upravit
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.likes}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Lajky</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.matches}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Shody</div>
          </div>
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">O mně</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Zájmy</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => <Badge key={i} variant="secondary" className="rounded-full">{i}</Badge>)}
            </div>
          </div>
        )}

        {profile.photos?.length > 1 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-2">Fotky</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
        {galleryOpen && (
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