import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image, Sparkles } from "lucide-react";
import ChatBubble from "../components/ChatBubble";

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [match, setMatch] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEnd = useRef(null);
  const fileRef = useRef(null);

  /* =========================
     INIT + AUTH
  ========================= */
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);

    let unsub;

    const init = async () => {
      unsub = await loadChat(user);
    };

    init();

    return () => {
      if (unsub) unsub();
    };
  }, [matchId]);

  /* =========================
     LOAD CHAT + REALTIME
  ========================= */
  const loadChat = async (user) => {
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) return;

    const matchData = matchSnap.data();
    setMatch(matchData);

    const otherUid = matchData.users.find((u) => u !== user.uid);

    const userSnap = await getDoc(doc(db, "users", otherUid));
    setOtherProfile(userSnap.data());

    const q = query(
      collection(db, "messages"),
      where("matchId", "==", matchId),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoading(false);
    });
  };

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = async (content, mediaUrl = "", mediaType = "text") => {
    const text = content.trim();

    if (!text && !mediaUrl) return;

    setSending(true);

    await addDoc(collection(db, "messages"), {
      matchId,
      sender: currentUser.uid,
      content: text,
      mediaUrl,
      mediaType,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "matches", matchId), {
      lastMessage: text || "📷 Foto",
      lastMessageAt: serverTimestamp(),
    });

    setNewMessage("");
    setSending(false);
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { storage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const { storage: appStorage } = await import("@/firebase");

    const fileRefStorage = ref(appStorage, `chat/${matchId}/${file.name}`);

    await uploadBytes(fileRefStorage, file);
    const url = await getDownloadURL(fileRefStorage);

    await sendMessage(
      "",
      url,
      file.type.startsWith("video") ? "video" : "image"
    );
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

  const photo = otherProfile?.photos?.[0];

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">

      {/* HEADER */}
      <div className="sticky top-0 z-40 glass px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft />
        </Button>

        <div className="w-10 h-10 rounded-xl overflow-hidden">
          {photo ? (
            <img src={photo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold">
            {otherProfile?.display_name || "Uživatel"}
          </h2>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender === currentUser.uid}
          />
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* INPUT */}
      <div className="glass p-3 flex gap-2 items-center">

        <button onClick={() => fileRef.current.click()}>
          <Image />
        </button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napiš zprávu..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(newMessage);
            }
          }}
        />

        <button
          onClick={() => sendMessage(newMessage.trim())}
          disabled={sending}
        >
          <Send />
        </button>
      </div>
    </div>
  );
}