import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const allMatches = await base44.entities.Match.list("-created_date");
    const myMatches = allMatches.filter((m) => (m.user1 === user.email || m.user2 === user.email) && m.status === "active");
    const allProfiles = await base44.entities.UserProfile.list();
    const profileMap = {};
    allProfiles.forEach((p) => { profileMap[p.created_by] = p; });
    setProfiles(profileMap);
    setMatches(myMatches);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-heading font-bold mb-6">Shody</h1>
      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading font-semibold text-lg mb-1">Zatím žádné shody</h3>
          <p className="text-muted-foreground text-sm max-w-xs">Pokračuj v procházení a najdi svůj protějšek!</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Nové shody</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {matches.map((match) => {
                const otherEmail = match.user1 === currentUser.email ? match.user2 : match.user1;
                const otherProfile = profiles[otherEmail];
                const photo = otherProfile?.photos?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";
                return (
                  <Link key={match.id} to={`/chat/${match.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-background">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-medium truncate max-w-[64px]">{otherProfile?.display_name || "Uživatel"}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Zprávy</h2>
            <div className="space-y-1">
              {matches.map((match) => {
                const otherEmail = match.user1 === currentUser.email ? match.user2 : match.user1;
                const otherProfile = profiles[otherEmail];
                const photo = otherProfile?.photos?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";
                return (
                  <Link key={match.id} to={`/chat/${match.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                    <img src={photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{otherProfile?.display_name || "Uživatel"}</h3>
                      <p className="text-xs text-muted-foreground truncate">{match.last_message || "Pozdravte se! 👋"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}