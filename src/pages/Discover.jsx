import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, X, Star, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ProfileCard from "../components/ProfileCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Discover() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [maxDistance, setMaxDistance] = useState(() => Number(localStorage.getItem("flame-distance") || 50));
  const [myCoords, setMyCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const allProfiles = await base44.entities.UserProfile.list();
    const myProf = allProfiles.find((p) => p.created_by === user.email) || null;
    setMyProfile(myProf);

    if (!myProf) { setLoading(false); return; }

    const coords = myProf.latitude && myProf.longitude
      ? { lat: myProf.latitude, lng: myProf.longitude }
      : null;
    setMyCoords(coords);

    const myLikes = await base44.entities.Like.filter({ from_user: user.email });
    const likedIds = new Set(myLikes.map((l) => l.to_user));

    const available = allProfiles.filter(
      (p) => p.created_by !== user.email && !likedIds.has(p.created_by)
    );
    setProfiles(available);
    setLoading(false);
  };

  const filteredProfiles = profiles.filter((p) => {
    if (!myCoords || !p.latitude || !p.longitude) return true;
    const dist = getDistanceKm(myCoords.lat, myCoords.lng, p.latitude, p.longitude);
    return dist <= maxDistance;
  });

  const handleAction = async (type) => {
    const profile = filteredProfiles[currentIndex];
    if (!profile) return;
    setDirection(type === "pass" ? "left" : "right");
    const user = await base44.auth.me();
    await base44.entities.Like.create({ from_user: user.email, to_user: profile.created_by, type });
    if (type === "like" || type === "super_like") {
      const theirLikes = await base44.entities.Like.filter({ from_user: profile.created_by, to_user: user.email });
      const mutual = theirLikes.find((l) => l.type === "like" || l.type === "super_like");
      if (mutual) {
        await base44.entities.Match.create({ user1: user.email, user2: profile.created_by, status: "active" });
        setMatchedProfile(profile);
        setShowMatch(true);
      }
    }
    setTimeout(() => { setCurrentIndex((i) => i + 1); setDirection(null); }, 300);
  };

  const saveDistance = (val) => {
    setMaxDistance(val);
    localStorage.setItem("flame-distance", val);
    setCurrentIndex(0);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!myProfile) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl font-heading font-bold mb-2">Vítejte na Flame</h1>
      <p className="text-muted-foreground mb-6 max-w-xs">Vytvořte si profil a začněte objevovat úžasné lidi ve svém okolí.</p>
      <Button onClick={() => navigate("/profile/edit")} size="lg" className="rounded-full px-8">Vytvořit profil</Button>
    </div>
  );

  const currentProfile = filteredProfiles[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
            <Heart className="w-5 h-5 fill-primary" /> Flame
          </h1>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Vzdálenost</span>
          </button>
        </div>

        {/* Distance filter panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Maximální vzdálenost</span>
                  <span className="text-sm font-bold text-primary">{maxDistance} km</span>
                </div>
                <Slider
                  min={5}
                  max={300}
                  step={5}
                  value={[maxDistance]}
                  onValueChange={([v]) => saveDistance(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5 km</span>
                  <span>300 km</span>
                </div>
                {!myCoords && (
                  <p className="text-xs text-amber-500 mt-3">
                    💡 Přidej svou polohu v profilu pro přesné filtrování vzdálenosti.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative" style={{ minHeight: 480 }}>
          <AnimatePresence mode="wait">
            {currentProfile ? (
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ x: direction === "left" ? -300 : direction === "right" ? 300 : 0, opacity: 0, rotate: direction === "left" ? -15 : direction === "right" ? 15 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileCard profile={currentProfile}>
                  <div className="flex items-center justify-center gap-4">
                    <Button onClick={() => handleAction("pass")} size="icon" variant="outline" className="w-14 h-14 rounded-full bg-white/10 border-white/30 backdrop-blur-sm hover:bg-red-500/80 hover:border-red-500 transition-all">
                      <X className="w-6 h-6 text-white" />
                    </Button>
                    <Button onClick={() => handleAction("super_like")} size="icon" variant="outline" className="w-12 h-12 rounded-full bg-white/10 border-white/30 backdrop-blur-sm hover:bg-blue-500/80 hover:border-blue-500 transition-all">
                      <Star className="w-5 h-5 text-white" />
                    </Button>
                    <Button onClick={() => handleAction("like")} size="icon" variant="outline" className="w-14 h-14 rounded-full bg-white/10 border-white/30 backdrop-blur-sm hover:bg-green-500/80 hover:border-green-500 transition-all">
                      <Heart className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </ProfileCard>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <RotateCcw className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">Žádné další profily</h3>
                <p className="text-muted-foreground text-sm">Zkus zvýšit vzdálenost nebo se vrať později!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match modal */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowMatch(false)}>
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="bg-card rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-3xl font-heading font-bold text-primary mb-2">Je to shoda! 🎉</h2>
              <p className="text-muted-foreground mb-6">Ty a {matchedProfile.display_name} jste se navzájem lajkovali!</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <img src={myProfile?.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-20 h-20 rounded-full object-cover border-4 border-primary" alt="Ty" />
                <Heart className="w-8 h-8 text-primary fill-primary" />
                <img src={matchedProfile?.photos?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"} className="w-20 h-20 rounded-full object-cover border-4 border-primary" alt={matchedProfile.display_name} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setShowMatch(false)}>Pokračovat</Button>
                <Button className="flex-1 rounded-full" onClick={() => navigate("/messages")}>Napsat zprávu</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}