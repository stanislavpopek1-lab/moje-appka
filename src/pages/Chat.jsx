import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image, Sparkles } from "lucide-react";
import ChatBubble from "../components/ChatBubble";

export default function Chat() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [match, setMatch] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { loadChat(); }, [matchId]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type === "create" && event.data.match_id === matchId) {
        setMessages((prev) => [...prev, event.data]);
      }
    });
    return unsubscribe;
  }, [matchId]);

  const loadChat = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    const allMatches = await base44.entities.Match.list();
    const thisMatch = allMatches.find((m) => m.id === matchId);
    setMatch(thisMatch);
    if (thisMatch) {
      const otherEmail = thisMatch.user1 === user.email ? thisMatch.user2 : thisMatch.user1;
      const allProfiles = await base44.entities.UserProfile.list();
      const other = allProfiles.find((p) => p.created_by === otherEmail);
      setOtherProfile(other);
      const allMessages = await base44.entities.Message.filter({ match_id: matchId }, "created_date");
      setMessages(allMessages);
    }
    setLoading(false);
  };

  const sendMessage = async (content, mediaUrl, mediaType) => {
    if (!content?.trim() && !mediaUrl) return;
    setSending(true);
    await base44.entities.Message.create({
      match_id: matchId,
      sender: currentUser.email,
      content: content || "",
      media_url: mediaUrl || "",
      media_type: mediaType || "none",
    });
    await base44.entities.Match.update(matchId, {
      last_message: content || "📷 Fotka",
      last_message_at: new Date().toISOString(),
    });
    setNewMessage("");
    setSending(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await sendMessage("", file_url, file.type.startsWith("video/") ? "video" : "image");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  const photo = otherProfile?.photos?.[0];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={() => navigate("/messages")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{otherProfile?.display_name || "Uživatel"}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-muted-foreground tracking-wide">Online</span>

          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl overflow-hidden mb-4"
              style={{ boxShadow: "0 0 0 3px rgba(218,165,32,0.35), 0 16px 48px rgba(0,0,0,0.4)" }}>
              {photo
                ? <img src={photo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-primary/20 flex items-center justify-center"><Sparkles className="w-8 h-8 text-primary" /></div>
              }
            </div>
            <h3 className="font-heading font-bold mb-1">{otherProfile?.display_name}</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Máte shodu! Prolomte ledy 💬</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.sender === currentUser?.email} />
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 glass border-t border-white/5 p-3 mb-16 md:mb-0">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage); }} className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex-shrink-0"
            onClick={() => fileRef.current?.click()}
          >
            <Image className="w-4.5 h-4.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageUpload} />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu..."
            className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-primary/50 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center disabled:opacity-40 transition-all hover:opacity-90 active:scale-90"
            style={{ background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))" }}
          >
            <Send className="w-4 h-4" style={{color: "hsl(35 25% 8%)"}} />
          </button>
        </form>
      </div>
    </div>
  );
}