import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        }`}
      >
        {message.media_url && message.media_type === "image" && (
          <img
            src={message.media_url}
            alt=""
            className="rounded-lg mb-2 max-w-full"
          />
        )}
        {message.media_url && message.media_type === "video" && (
          <video
            src={message.media_url}
            controls
            className="rounded-lg mb-2 max-w-full"
          />
        )}
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            {message.created_date
              ? format(new Date(message.created_date), "HH:mm")
              : ""}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="w-3 h-3 text-primary-foreground/60" />
            ) : (
              <Check className="w-3 h-3 text-primary-foreground/60" />
            )
          )}
        </div>
      </div>
    </div>
  );
}