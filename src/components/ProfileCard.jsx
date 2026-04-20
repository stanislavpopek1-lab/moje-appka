import { useState } from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Photo */}
      <img
        src={photos[photoIndex]}
        alt={profile?.display_name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
      />

      {/* Photo indicators */}
      {photos.length > 1 && (
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all ${
                i === photoIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo navigation */}
      {photos.length > 1 && (
        <>
          <button onClick={prevPhoto} className="absolute left-0 top-0 bottom-20 w-1/3 z-10" />
          <button onClick={nextPhoto} className="absolute right-0 top-0 bottom-20 w-1/3 z-10" />
        </>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
        <div className="flex items-end gap-2 mb-2">
          <h2 className="text-2xl font-heading font-bold">
            {profile?.display_name}
          </h2>
          <span className="text-xl font-light mb-0.5">{profile?.age}</span>
        </div>
        {profile?.location && (
          <div className="flex items-center gap-1 text-white/80 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile.location}</span>
          </div>
        )}
        {profile?.bio && (
          <p className="text-sm text-white/80 line-clamp-2 mb-3">{profile.bio}</p>
        )}
        {profile?.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs"
              >
                {interest}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons slot */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}