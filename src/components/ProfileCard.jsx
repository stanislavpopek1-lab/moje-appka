import { useState } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfileCard({ profile, children }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = profile?.photos?.length ? profile.photos : [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop"
  ];

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % photos.length);
  };
  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl group"
      style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      {/* Photo */}
      <img
        src={photos[photoIndex]}
        alt={profile?.display_name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />

      {/* Cinematic gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

      {/* Photo strip indicators */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                i === photoIndex
                  ? "bg-white"
                  : "bg-white/25"
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo navigation zones */}
      {photos.length > 1 && (
        <>
          <button onClick={prevPhoto} className="absolute left-0 top-0 bottom-24 w-2/5 z-10" />
          <button onClick={nextPhoto} className="absolute right-0 top-0 bottom-24 w-2/5 z-10" />
        </>
      )}

      {/* Info panel */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            {profile?.display_name}
          </h2>
          <span className="text-2xl font-light text-white/70">{profile?.age}</span>
        </div>

        {profile?.location && (
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-3 font-medium tracking-wide uppercase">
            <MapPin className="w-3 h-3" />
            <span>{profile.location}</span>
          </div>
        )}

        {profile?.bio && (
          <p className="text-sm text-white/70 line-clamp-2 mb-3 leading-relaxed">{profile.bio}</p>
        )}

        {profile?.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {profile.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="text-[11px] px-2.5 py-1 rounded-full font-medium tracking-wide"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {children && <div>{children}</div>}
      </div>
    </div>
  );
}