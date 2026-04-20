import { format } from "date-fns";
import { CheckCheck, Check } from "lucide-react";

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Media */}
        {message.media_url && message.media_type === "image" && (
          <div className="rounded-2xl overflow-hidden" style={{ maxWidth: 240 }}>
            <img src={message.media_url} alt="" className="w-full object-cover" />
          </div>
        )}
        {message.media_url && message.media_type === "video" && (
          <div className="rounded-2xl overflow-hidden" style={{ maxWidth: 240 }}>
            <video src={message.media_url} controls className="w-full" />
          </div>
        )}

        {/* Text bubble */}
        {message.content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isOwn
                ? "rounded-br-sm text-white"
                : "rounded-bl-sm glass text-foreground"
            }`}
            style={isOwn ? { background: "linear-gradient(135deg, hsl(350 80% 58%), hsl(25 80% 55%))" } : {}}
          >
            {message.content}
          </div>
        )}

        {/* Timestamp & read */}
        <div className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-muted-foreground">
            {message.created_date ? format(new Date(message.created_date), "HH:mm") : ""}
          </span>
          {isOwn && (
            message.is_read
              ? <CheckCheck className="w-3 h-3 text-primary" />
              : <Check className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}