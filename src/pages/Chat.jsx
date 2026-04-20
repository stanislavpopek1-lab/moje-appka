import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image, Heart } from "lucide-react";
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

  useEffect(() => {
    loadChat();
  }, [matchId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const otherEmail =
        thisMatch.user1 === user.email ? thisMatch.user2 : thisMatch.user1;
      const allProfiles = await base44.entities.UserProfile.list();
      const other = allProfiles.find((p) => p.created_by === otherEmail);
      setOtherProfile(other);

      const allMessages = await base44.entities.Message.filter(
        { match_id: matchId },
        "created_date"
      );
      setMessages(allMessages);
    }
    setLoading(false);
  };

  const sendMessage = async (content, mediaUrl, mediaType) => {
    if (!content?.trim() && !mediaUrl) return;
    setSending(true);

    const msg = {
      match_id: matchId,
      sender: currentUser.email,
      content: content || "",
      media_url: mediaUrl || "",
      media_type: mediaType || "none",
    };

    await base44.entities.Message.create(msg);
    await base44.entities.Match.update(matchId, {
      last_message: content || "📷 Photo",
      last_message_at: new Date().toISOString(),
    });

    setNewMessage("");
    setSending(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const isVideo = file.type.startsWith("video/");
    await sendMessage("", file_url, isVideo ? "video" : "image");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const otherPhoto =
    otherProfile?.photos?.[0] ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-3 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full flex-shrink-0"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img
          src={otherPhoto}
          alt=""
          className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">
            {otherProfile?.display_name || "Someone"}
          </h2>
          <p className="text-[10px] text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
              <img src={otherPhoto} alt="" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-heading font-semibold mb-1">
              {otherProfile?.display_name}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Shodli jste se! Začněte konverzaci 💬 Start a conversation 💬
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender === currentUser?.email}
          />
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border-t border-border p-3 mb-16 md:mb-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={() => fileRef.current?.click()}
          >
            <Image className="w-5 h-5 text-muted-foreground" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Napište zprávu..."
            className="rounded-full bg-muted border-0"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full flex-shrink-0"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}