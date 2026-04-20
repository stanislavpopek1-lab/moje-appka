import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, X, Star, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
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
  const [ageRange, setAgeRange] = useState(() => {
    const saved = localStorage.getItem("flame-age-range");
    return saved ? JSON.parse(saved) : [18, 99];
  });
  const [myCoords, setMyCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const allProfiles = await base44.entities.UserProfile.list();
    const myProf = allProfiles.find((p) => p.created_by === user.email) || null;
    setMyProfile(myProf);
    if (!myProf) { setLoading(false); return; }
    const coords = myProf.latitude && myProf.longitude ? { lat: myProf.latitude, lng: myProf.longitude } : null;
    setMyCoords(coords);
    const myLikes = await base44.entities.Like.filter({ from_user: user.email });
    const likedIds = new Set(myLikes.map((l) => l.to_user));
    const available = allProfiles.filter((p) => p.created_by !== user.email && !likedIds.has(p.created_by));
    setProfiles(available);
    setLoading(false);
  };

  const filteredProfiles = profiles.filter((p) => {
    if (myCoords && p.latitude && p.longitude) {
      const dist = getDistanceKm(myCoords.lat, myCoords.lng, p.latitude, p.longitude);
      if (dist > maxDistance) return false;
    }
    if (p.age && (p.age < ageRange[0] || p.age > ageRange[1])) return false;
    return true;
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

  const saveDistance = (val) => { setMaxDistance(val); localStorage.setItem("flame-distance", val); setCurrentIndex(0); };
  const saveAgeRange = (val) => { setAgeRange(val); localStorage.setItem("flame-age-range", JSON.stringify(val)); setCurrentIndex(0); };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  if (!myProfile) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-flame flex items-center justify-center mb-8 animate-pulse-glow">
        <Sparkles className="w-12 h-12" style={{color: "hsl(35 25% 8%)"}} />
      </div>
      <h1 className="text-4xl font-heading font-bold mb-3 text-gradient">Vítej v Zlatíčka</h1>
      <p className="text-muted-foreground mb-8 max-w-xs leading-relaxed">Vytvoř si profil a začni objevovat skvělé lidi ve svém okolí.</p>
      <Button onClick={() => navigate("/profile/edit")} size="lg"
        className="rounded-2xl px-10 h-12 bg-gradient-flame border-0 font-semibold text-base hover:opacity-90 transition-opacity"
        style={{color: "hsl(35 25% 8%)"}}>
        Vytvořit profil
      </Button>
    </div>
  );

  const currentProfile = filteredProfiles[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-flame flex items-center justify-center glow-sm">
              <span className="text-sm font-heading font-bold" style={{color: "hsl(35 25% 8%)"}}>Z</span>
            </div>
            <span className="text-xl font-heading font-bold text-gradient">Zlatíčka</span>
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-2 text-xs font-medium tracking-widest uppercase px-4 py-2 rounded-xl transition-all duration-300 ${
              showFilter
                ? "bg-primary/20 text-primary border border-primary/30"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtry
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="overflow-hidden mb-5"
            >
              <div className="glass rounded-2xl p-5 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Max. vzdálenost</span>
                    <span className="text-sm font-bold text-primary">{maxDistance} km</span>
                  </div>
                  <Slider min={5} max={300} step={5} value={[maxDistance]} onValueChange={([v]) => saveDistance(v)} className="w-full" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2 tracking-wide">
                    <span>5 km</span><span>300 km</span>
                  </div>
                  {!myCoords && (
                    <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-1.5">
                      <span>💡</span> Přidej polohu v profilu pro filtrování vzdálenosti.
                    </p>
                  )}
                </div>
                <div className="border-t border-white/5 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Věkové rozmezí</span>
                    <span className="text-sm font-bold text-primary">{ageRange[0]} – {ageRange[1]}</span>
                  </div>
                  <Slider min={18} max={99} step={1} value={ageRange} onValueChange={saveAgeRange} className="w-full" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2 tracking-wide">
                    <span>18</span><span>99</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card stack */}
        <div className="relative" style={{ minHeight: 500 }}>
          <AnimatePresence mode="wait">
            {currentProfile ? (
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{
                  x: direction === "left" ? -350 : direction === "right" ? 350 : 0,
                  opacity: 0,
                  rotate: direction === "left" ? -18 : direction === "right" ? 18 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <ProfileCard profile={currentProfile}>
                  {/* Action buttons */}
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button
                      onClick={() => handleAction("pass")}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105"
                      style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => handleAction("super_like")}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105"
                      style={{ background: "rgba(99,179,237,0.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(99,179,237,0.3)" }}
                    >
                      <Star className="w-5 h-5 text-blue-300" />
                    </button>
                    <button
                      onClick={() => handleAction("like")}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105"
                      style={{ background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))", boxShadow: "0 8px 24px rgba(218,165,32,0.4)" }}
                    >
                      <Heart className="w-6 h-6 fill-current" style={{color: "hsl(35 25% 8%)"}} />
                    </button>
                  </div>
                </ProfileCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-24"
              >
                <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center mb-6">
                  <RotateCcw className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Žádné další profily</h3>
                <p className="text-muted-foreground text-sm">Zkus rozšířit filtry nebo se vrať později!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Match modal */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
            onClick={() => setShowMatch(false)}
          >
            <motion.div
              initial={{ scale: 0.75, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.75, y: 40 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="glass-strong rounded-3xl p-8 text-center max-w-sm w-full"
              style={{ border: "1px solid rgba(218,165,32,0.4)", boxShadow: "0 0 80px rgba(218,165,32,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">✨</div>
              <h2 className="text-3xl font-heading font-bold text-gradient mb-2">Shoda!</h2>
              <p className="text-muted-foreground mb-7 text-sm">Ty a <span className="text-foreground font-semibold">{matchedProfile.display_name}</span> se navzájem lajkovali!</p>

              <div className="flex items-center justify-center gap-5 mb-8">
                <div className="relative">
                  <img src={myProfile?.photos?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 20px rgba(218,165,32,0.6)" }} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-flame flex items-center justify-center glow-sm">
                  <Heart className="w-5 h-5 fill-current" style={{color: "hsl(35 25% 8%)"}} />
                </div>
                <div className="relative">
                  <img src={matchedProfile?.photos?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                  <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "0 0 20px rgba(218,165,32,0.6)" }} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11 border-white/10 hover:bg-white/5" onClick={() => setShowMatch(false)}>
                  Pokračovat
                </Button>
                <Button className="flex-1 rounded-xl h-11 bg-gradient-flame border-0 hover:opacity-90" onClick={() => navigate("/messages")}>
                  Napsat
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}