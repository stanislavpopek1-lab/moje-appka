import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { Heart, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  /* =========================
     LOAD MATCHES
  ========================= */
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);

    /* MATCHES */
    const snap = await getDocs(collection(db, "matches"));
    const allMatches = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const myMatches = allMatches.filter(
      (m) =>
        (m.user1 === user.uid || m.user2 === user.uid) &&
        m.status === "active"
    );

    /* PROFILES */
    const profSnap = await getDocs(collection(db, "users"));
    const allProfiles = profSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const map = {};
    allProfiles.forEach((p) => {
      map[p.uid] = p;
    });

    setProfiles(map);
    setMatches(myMatches);
    setLoading(false);
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pt-6">

      <h1 className="text-2xl font-heading font-bold mb-6">
        <span className="text-gradient">Shody</span>
      </h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center mb-6 animate-pulse-glow">
            <Heart className="w-9 h-9 text-primary" />
          </div>
          <h3 className="font-heading font-bold text-xl mb-2">
            Zatím žádné shody
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Swipuj dál a najdi svou dokonalou shodu!
          </p>
        </div>
      ) : (
        <>
          {/* BUBBLES */}
          <div className="mb-8">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
              Nové shody
            </p>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {matches.map((match) => {
                const otherUid =
                  match.user1 === currentUser.uid
                    ? match.user2
                    : match.user1;

                const otherProfile = profiles[otherUid];
                const photo = otherProfile?.photos?.[0];

                return (
                  <Link
                    key={match.id}
                    to={`/chat/${match.id}`}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className="relative">
                      <div
                        className="w-[72px] h-[72px] rounded-2xl overflow-hidden group-hover:scale-105 transition-transform"
                        style={{
                          boxShadow:
                            "0 0 0 2px rgba(220,60,90,0.5), 0 8px 24px rgba(0,0,0,0.3)",
                        }}
                      >
                        {photo ? (
                          <img
                            src={photo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                    </div>

                    <span className="text-[11px] font-medium max-w-[72px] text-center truncate">
                      {otherProfile?.display_name || "Uživatel"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CONVERSATIONS */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Konverzace
            </p>

            <div className="space-y-2">
              {matches.map((match) => {
                const otherUid =
                  match.user1 === currentUser.uid
                    ? match.user2
                    : match.user1;

                const otherProfile = profiles[otherUid];
                const photo = otherProfile?.photos?.[0];

                return (
                  <Link
                    key={match.id}
                    to={`/chat/${match.id}`}
                    className="flex items-center gap-4 p-3.5 rounded-2xl glass hover:bg-white/5 transition-all group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden">
                        {photo ? (
                          <img
                            src={photo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">
                        {otherProfile?.display_name || "User"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {match.last_message || "Pozdrav! 👋"}
                      </p>
                    </div>

                    <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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