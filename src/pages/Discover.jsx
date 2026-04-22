import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

import {
  Heart,
  X,
  Star,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ProfileCard from "../components/ProfileCard";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

/* =========================
   DISTANCE FUNCTION
========================= */
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
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);

  const [maxDistance, setMaxDistance] = useState(50);
  const [ageRange, setAgeRange] = useState([18, 99]);

  const [myProfile, setMyProfile] = useState(null);
  const [myCoords, setMyCoords] = useState(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [60, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -60], [1, 0]);

  const navigate = useNavigate();

  /* =========================
     AUTH CHECK (FIREBASE)
  ========================= */
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login"); // nebo onboarding modal
      return;
    }
    loadData();
  }, [user]);

  /* =========================
     LOAD DATA (FIRESTORE)
  ========================= */
  const loadData = async () => {
    const snap = await getDocs(collection(db, "users"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const me = data.find((u) => u.uid === user.uid);
    setMyProfile(me);

    if (me?.latitude && me?.longitude) {
      setMyCoords({ lat: me.latitude, lng: me.longitude });
    }

    const filtered = data.filter((u) => u.uid !== user.uid);
    setProfiles(filtered);

    setLoading(false);
  };

  /* =========================
     FILTERS
  ========================= */
  const filteredProfiles = profiles.filter((p) => {
    if (myCoords && p.latitude && p.longitude) {
      const dist = getDistanceKm(
        myCoords.lat,
        myCoords.lng,
        p.latitude,
        p.longitude
      );
      if (dist > maxDistance) return false;
    }

    if (p.age && (p.age < ageRange[0] || p.age > ageRange[1])) return false;

    return true;
  });

  const profile = filteredProfiles[index];

  /* =========================
     SWIPE ACTION
  ========================= */
  const handleAction = async (type) => {
    if (!profile) return;

    const likeRef = doc(db, "likes", user.uid);

    await setDoc(
      likeRef,
      {
        from: user.uid,
        [type]: arrayUnion(profile.uid),
      },
      { merge: true }
    );

    // MATCH LOGIKA
    if (type === "like" || type === "super_like") {
      const theirRef = doc(db, "likes", profile.uid);
      const theirSnap = await getDoc(theirRef);

      const theirData = theirSnap.data();

      if (theirData?.like?.includes(user.uid)) {
        await setDoc(doc(db, "matches", `${user.uid}_${profile.uid}`), {
          users: [user.uid, profile.uid],
        });

        setMatchedProfile(profile);
        setShowMatch(true);
      }
    }

    setDirection(type === "pass" ? "left" : "right");

    setTimeout(() => {
      setIndex((i) => i + 1);
      x.set(0);
      setDirection(null);
    }, 250);
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* =========================
     NO USER
  ========================= */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Přihlaš se prosím 😄</p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex flex-col items-center p-4">

      {/* CARD AREA */}
      <div className="relative w-full max-w-md h-[520px]">

        {/* LIKE / NOPE */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-10 text-green-400 font-bold text-3xl z-10"
        >
          LIKE
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-10 text-red-400 font-bold text-3xl z-10"
        >
          NOPE
        </motion.div>

        <AnimatePresence mode="wait">
          {profile ? (
            <motion.div
              key={profile.uid}
              style={{ x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 120) handleAction("like");
                else if (info.offset.x < -120) handleAction("pass");
                else x.set(0);
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfileCard profile={profile} />

              {/* BUTTONS */}
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={() => handleAction("pass")}>
                  <X />
                </button>

                <button onClick={() => handleAction("super_like")}>
                  <Star />
                </button>

                <button onClick={() => handleAction("like")}>
                  <Heart />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center mt-20">
              Žádné další profily 😅
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* MATCH MODAL */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/80"
            onClick={() => setShowMatch(false)}
          >
            <div className="bg-white p-6 rounded-2xl text-center">
              💞 Match s {matchedProfile?.username}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}