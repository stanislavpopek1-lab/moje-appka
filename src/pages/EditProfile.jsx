import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, ArrowLeft, MapPin, Loader2, LogOut, Trash2, User } from "lucide-react";
import { toast } from "sonner";

const INTEREST_OPTIONS = [
  "Cestování", "Hudba", "Fitness", "Vaření", "Fotografie", "Umění",
  "Čtení", "Gaming", "Turistika", "Filmy", "Tanec", "Jóga",
  "Káva", "Víno", "Psi", "Kočky", "Technologie", "Móda",
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
    if (!navigator.geolocation) { toast.error("Geolokace není v tomto prohlížeči dostupná"); return; }
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

  const handleDeleteAccount = async () => {
    if (!window.confirm("Opravdu chceš smazat svůj účet? Tato akce je nevratná.")) return;
    if (existingId) await base44.entities.UserProfile.delete(existingId);
    base44.auth.logout();
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.display_name.trim()) newErrors.display_name = "Jméno je povinné";
    if (!form.age) newErrors.age = "Věk je povinný";
    if (Number(form.age) < 18) newErrors.age = "Musíš mít alespoň 18 let";
    if (Number(form.age) > 99) newErrors.age = "Maximální věk je 99 let";
    if (!form.gender) newErrors.gender = "Pohlaví je povinné";
    if (!form.bio.trim()) newErrors.bio = "Bio je povinné";
    if (form.interests.length < 3) newErrors.interests = "Vyber alespoň 3 zájmy";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { toast.error("Oprav označená pole"); return; }
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
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );

  const fieldClass = (err) => `mt-1 bg-white/5 border-white/10 focus-visible:ring-primary/50 rounded-xl ${err ? "border-destructive/60 ring-1 ring-destructive/30" : ""}`;

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-28 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <h1 className="text-xl font-heading font-bold">
          {existingId ? "Upravit profil" : "Vytvořit profil"}
        </h1>
      </div>

      {/* Photos */}
      <section className="mb-8">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Fotky</p>
        <div className="grid grid-cols-3 gap-2">
          {form.photos.length === 0 && (
            <div className="aspect-square rounded-2xl glass flex flex-col items-center justify-center gap-1">
              <User className="w-8 h-8 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground">Žádná fotka</span>
            </div>
          )}
          {form.photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {form.photos.length < 6 && (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all">
              {uploading
                ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                : <><Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Přidat</span></>
              }
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handlePhotoUpload} />
      </section>

      {/* Basic Info */}
      <section className="space-y-4 mb-8">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Základní info</p>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Jméno *</Label>
          <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Tvoje jméno" className={fieldClass(errors.display_name)} />
          {errors.display_name && <p className="text-xs text-destructive mt-1">{errors.display_name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Věk *</Label>
            <Input type="number" min={18} max={99} value={form.age}
              onChange={(e) => { const v = e.target.value; if (v === "" || (Number(v) >= 1 && Number(v) <= 99)) setForm({ ...form, age: v }); }}
              placeholder="25" className={fieldClass(errors.age)} />
            {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Pohlaví *</Label>
            <Select value={form.gender} onValueChange={(v) => { setForm({ ...form, gender: v }); setErrors((e) => ({ ...e, gender: undefined })); }}>
              <SelectTrigger className={fieldClass(errors.gender)}><SelectValue placeholder="Vybrat" /></SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="Male">Muž</SelectItem>
                <SelectItem value="Female">Žena</SelectItem>
                <SelectItem value="Non-binary">Nebinární</SelectItem>
                <SelectItem value="Other">Jiné</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Hledám</Label>
          <Select value={form.looking_for} onValueChange={(v) => setForm({ ...form, looking_for: v })}>
            <SelectTrigger className={fieldClass(false)}><SelectValue placeholder="Vyber typ vztahu" /></SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="long_term">💍 Dlouhodobý vztah</SelectItem>
              <SelectItem value="short_term">🔥 Krátkodobé dobrodružství</SelectItem>
              <SelectItem value="casual">😊 Volné rande</SelectItem>
              <SelectItem value="friendship">👫 Přátelství</SelectItem>
              <SelectItem value="open">🌈 Otevřený vztah</SelectItem>
              <SelectItem value="unsure">🤷 Ještě nevím</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Město</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="např. Praha" className={fieldClass(false)} />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">GPS poloha</Label>
          <div className="flex items-center gap-2 mt-1">
            <button type="button" onClick={detectLocation} disabled={locating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-xs font-medium hover:bg-white/5 transition-colors disabled:opacity-60">
              {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-primary" />}
              {form.latitude ? "Poloha nastavena ✓" : "Zjistit polohu"}
            </button>
            {form.latitude && <span className="text-xs text-muted-foreground">{form.latitude.toFixed(3)}, {form.longitude.toFixed(3)}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Potřebné pro filtrování vzdálenosti</p>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">O mně *</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Řekni lidem něco o sobě..." rows={4}
            className={`resize-none ${fieldClass(errors.bio)}`} />
          {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio}</p>}
        </div>
      </section>

      {/* Interests */}
      <section className="mb-8">
        <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${errors.interests ? "text-destructive" : "text-muted-foreground"}`}>
          Zájmy ({form.interests.length}/8) — min. 3
        </p>
        {errors.interests && <p className="text-xs text-destructive mb-2">{errors.interests}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = form.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => { if (form.interests.length < 8 || selected) toggleInterest(interest); }}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 ${
                  selected
                    ? "text-white"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
                style={selected ? {
                  background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))",
                  boxShadow: "0 4px 12px rgba(218,165,32,0.3)",
                  color: "hsl(35 25% 8%)"
                } : {}}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))", boxShadow: "0 8px 32px rgba(218,165,32,0.35)", color: "hsl(35 25% 8%)" }}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (existingId ? "Uložit změny" : "Vytvořit profil")}
      </button>

      {existingId && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
          <button onClick={() => base44.auth.logout()}
            className="w-full h-11 rounded-2xl glass flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4" /> Odhlásit se
          </button>
          <button onClick={handleDeleteAccount}
            className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm text-destructive hover:bg-destructive/10 transition-all border border-destructive/20">
            <Trash2 className="w-4 h-4" /> Smazat účet
          </button>
        </div>
      )}
    </div>
  );
}