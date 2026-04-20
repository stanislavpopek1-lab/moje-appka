import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function MatchCard({ match, otherProfile, currentUser }) {
  const photo = otherProfile?.photos?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";
  
  return (
    <Link
      to={`/chat/${match.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
    >
      <div className="relative">
        <img
          src={photo}
          alt={otherProfile?.display_name}
          className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">
            {otherProfile?.display_name || "Someone"}
          </h3>
          {match.last_message_at && (
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(match.last_message_at), "HH:mm")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {match.last_message || "Say hello! 👋"}
        </p>
      </div>
    </Link>
  );
}