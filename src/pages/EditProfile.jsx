import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, X, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { useState as useLocalState } from "react";
import { toast } from "sonner";

const INTEREST_OPTIONS = [
  "Cestování", "Hudba", "Fitness", "Vaření", "Fotografie", "Umění",
  "Čtení", "Hry", "Turistika", "Filmy", "Tanec", "Jóga",
  "Káva", "Víno", "Psi", "Kočky", "Tech", "Móda",
  "Sport", "Pláž", "Hory", "Gastro", "Netflix", "Koncerty"
];

export default function EditProfile() {
  const [form, setForm] = useState({
    display_name: "", age: "", gender: "", looking_for: "",
    bio: "", photos: [], interests: [], location: "",
    latitude: null, longitude: null,
  });
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    if (profiles.length > 0) {
      const p = profiles[0];
      setExistingId(p.id);
      setForm({
        display_name: p.display_name || "", age: p.age || "",
        gender: p.gender || "", looking_for: p.looking_for || "",
        bio: p.bio || "", photos: p.photos || [], interests: p.interests || [],
        location: p.location || "", latitude: p.latitude || null, longitude: p.longitude || null,
      });
    } else {
      setForm((f) => ({ ...f, display_name: user.full_name || "" }));
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, photos: [...f.photos, file_url] }));
    setUploading(false);
  };

  const removePhoto = (i) => setForm((f) => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }));

  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Poloha není dostupná v tomto prohlížeči"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        toast.success("Poloha zjištěna!");
        setLocating(false);
      },
      () => { toast.error("Nepodařilo se zjistit polohu"); setLocating(false); }
    );
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.display_name.trim()) newErrors.display_name = "Jméno je povinné";
    if (!form.age) newErrors.age = "Věk je povinný";
    if (Number(form.age) < 18) newErrors.age = "Musíš být starší 18 let";
    if (!form.gender) newErrors.gender = "Pohlaví je povinné";
    if (!form.bio.trim()) newErrors.bio = "O mně je povinné";
    if (form.interests.length < 3) newErrors.interests = "Vyber alespoň 3 zájmy";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Oprav označená pole");
      return;
    }
    setSaving(true);
    const data = { ...form, age: Number(form.age), is_active: true };
    if (existingId) {
      await base44.entities.UserProfile.update(existingId, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }
    toast.success("Profil uložen!");
    setSaving(false);
    navigate("/profile");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-heading font-bold">{existingId ? "Upravit profil" : "Vytvořit profil"}</h1>
      </div>

      {/* Photos */}
      <div className="mb-8">
        <Label className="text-sm font-medium mb-3 block">Fotky</Label>
        <div className="grid grid-cols-3 gap-2">
          {form.photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
          {form.photos.length < 6 && (
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors">
              {uploading ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <><Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Přidat</span></>}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePhotoUpload} />
      </div>

      {/* Basic Info */}
      <div className="space-y-4 mb-8">
        <div>
          <Label>Jméno *</Label>
          <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Tvoëe jméno" className={`mt-1 ${errors.display_name ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
          {errors.display_name && <p className="text-xs text-red-500 mt-1">{errors.display_name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Věk *</Label>
            <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" className={`mt-1 ${errors.age ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </div>
          <div>
            <Label>Pohlaví *</Label>
            <Select value={form.gender} onValueChange={(v) => { setForm({ ...form, gender: v }); setErrors((e) => ({ ...e, gender: undefined })); }}>
              <SelectTrigger className={`mt-1 ${errors.gender ? 'border-red-500 ring-1 ring-red-500' : ''}`}><SelectValue placeholder="Vybrat" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Muž</SelectItem>
                <SelectItem value="Female">Žena</SelectItem>
                <SelectItem value="Non-binary">Nebinární</SelectItem>
                <SelectItem value="Other">Jiné</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
          </div>
        </div>
        <div>
          <Label>Hledám</Label>
          <Select value={form.looking_for} onValueChange={(v) => setForm({ ...form, looking_for: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Vybrat preference" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Muže</SelectItem>
              <SelectItem value="Female">Ženu</SelectItem>
              <SelectItem value="Everyone">Kohokoliv</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Město</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="např. Praha" className="mt-1" />
        </div>
        <div>
          <Label>Poloha GPS</Label>
          <div className="flex items-center gap-2 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={locating} className="rounded-full gap-1.5">
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {form.latitude ? "Poloha zjištěna ✓" : "Zjistit polohu"}
            </Button>
            {form.latitude && <span className="text-xs text-muted-foreground">{form.latitude.toFixed(3)}, {form.longitude.toFixed(3)}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Potřebné pro filtrování vzdálenosti</p>
        </div>
        <div>
          <Label>O mně *</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Řekni lidem něco o sobě..." rows={4} className={`mt-1 ${errors.bio ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
          {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
        </div>
      </div>

      {/* Interests */}
      <div className="mb-8">
        <Label className={`text-sm font-medium mb-3 block ${errors.interests ? 'text-red-500' : ''}`}>
          Zájmy ({form.interests.length}/8) <span className="text-muted-foreground font-normal">– minimum 3</span>
        </Label>
        {errors.interests && <p className="text-xs text-red-500 mb-2">{errors.interests}</p>}
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <Badge
              key={interest}
              variant={form.interests.includes(interest) ? "default" : "outline"}
              className={`cursor-pointer transition-all ${form.interests.includes(interest) ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"}`}
              onClick={() => { if (form.interests.length < 8 || form.interests.includes(interest)) toggleInterest(interest); }}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-full h-12 text-base font-semibold" size="lg">
        {saving ? "Ukládám..." : existingId ? "Uložit změny" : "Vytvořit profil"}
      </Button>
    </div>
  );
}