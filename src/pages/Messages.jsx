import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function Messages() {
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const allMatches = await base44.entities.Match.list("-last_message_at");
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
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pt-6">
      <h1 className="text-2xl font-heading font-bold mb-6">
        <span className="text-gradient">Zprávy</span>
      </h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center mb-6">
            <MessageCircle className="w-9 h-9 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-bold text-xl mb-2">Žádné konverzace</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">Najdi shodu a začni chatovat!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => {
            const otherEmail = match.user1 === currentUser.email ? match.user2 : match.user1;
            const otherProfile = profiles[otherEmail];
            const photo = otherProfile?.photos?.[0];
            return (
              <Link key={match.id} to={`/chat/${match.id}`}
                className="flex items-center gap-4 p-3.5 rounded-2xl glass hover:bg-white/5 transition-all duration-200 group">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden">
                    {photo ? (
                      <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-sm">{otherProfile?.display_name || "User"}</h3>
                    {match.last_message_at && (
                      <span className="text-[10px] text-muted-foreground tracking-wide">
                        {format(new Date(match.last_message_at), "d MMM")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{match.last_message || "Pozdrav! 👋"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}