import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/firebase";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  onAuthStateChanged,
  deleteUser,
  signOut,
} from "firebase/auth";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Camera,
  X,
  ArrowLeft,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

const INTEREST_OPTIONS = [
  "Cestování","Hudba","Fitness","Vaření","Fotografie","Umění",
  "Čtení","Gaming","Turistika","Filmy","Tanec","Jóga",
  "Káva","Víno","Psi","Kočky","Technologie","Móda",
  "Sport","Pláž","Hory","Gastro","Netflix","Koncerty"
];

export default function EditProfile() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    display_name: "",
    age: "",
    gender: "",
    looking_for: "",
    bio: "",
    photos: [],
    interests: [],
    location: "",
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const fileRef = useRef(null);
  const navigate = useNavigate();

  /* =========================
     AUTH LISTENER (FIXED)
  ========================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  /* =========================
     LOAD PROFILE (FIXED FLOW)
  ========================= */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }

    loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setForm({
          display_name: data.display_name || "",
          age: data.age || "",
          gender: data.gender || "",
          looking_for: data.looking_for || "",
          bio: data.bio || "",
          photos: data.photos || [],
          interests: data.interests || [],
          location: data.location || "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        });
      } else {
        setForm({
          display_name: user.displayName || "",
          age: "",
          gender: "",
          looking_for: "",
          bio: "",
          photos: [],
          interests: [],
          location: "",
          latitude: null,
          longitude: null,
        });
      }
    } catch (err) {
      console.error("LOAD ERROR:", err);
      toast.error("Chyba načítání profilu");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PHOTO UPLOAD
  ========================= */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (form.photos.length >= 6) {
      toast.error("Max 6 fotek");
      return;
    }

    try {
      setUploading(true);

      const storageRef = ref(
        storage,
        `profiles/${user.uid}/${Date.now()}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setForm((f) => ({
        ...f,
        photos: [...f.photos, url],
      }));
    } catch (err) {
      console.error(err);
      toast.error("Upload selhal");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (i) => {
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, idx) => idx !== i),
    }));
  };

  /* =========================
     INTERESTS
  ========================= */
  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  };

  /* =========================
     VALIDATION
  ========================= */
  const validate = () => {
    const e = {};
    const age = Number(form.age);

    if (!form.display_name) e.display_name = "Povinné";
    if (!form.age) e.age = "Povinné";
    if (age < 18 || age > 99) e.age = "18–99";
    if (!form.gender) e.gender = "Povinné";
    if (!form.bio) e.bio = "Povinné";
    if (form.interests.length < 3) e.interests = "Min 3";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* =========================
     SAVE
  ========================= */
  const handleSave = async () => {
    if (!user) return;
    if (!validate()) return;

    setSaving(true);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...form,
          uid: user.uid,
          email: user.email,
        },
        { merge: true }
      );

      toast.success("Uloženo");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Chyba ukládání");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE ACCOUNT
  ========================= */
  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm("Smazat účet?")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Smazání selhalo");
    }
  };

  /* =========================
     LOADING SCREEN (FIXED)
  ========================= */
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  const field = (err) =>
    `mt-1 bg-white/5 border rounded-xl ${
      err ? "border-red-500" : "border-white/10"
    }`;

  return (
    <div className="min-h-screen max-w-lg mx-auto p-4 pb-28 pt-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">Upravit profil</h1>
      </div>

      {/* PHOTOS */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {form.photos.map((p, i) => (
          <div key={i} className="relative">
            <img src={p} className="w-full h-24 object-cover rounded-xl" />
            <button onClick={() => removePhoto(i)} className="absolute top-1 right-1">
              <X />
            </button>
          </div>
        ))}

        {form.photos.length < 6 && (
          <button onClick={() => fileRef.current.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
          </button>
        )}

        <input ref={fileRef} type="file" hidden onChange={handlePhotoUpload} />
      </div>

      {/* FORM */}
      <Input
        value={form.display_name}
        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        placeholder="Jméno"
        className={field(errors.display_name)}
      />

      <Input
        type="number"
        value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })}
        placeholder="Věk"
        className={field(errors.age)}
      />

      <Select
        value={form.gender}
        onValueChange={(v) => setForm({ ...form, gender: v })}
      >
        <SelectTrigger className={field(errors.gender)}>
          <SelectValue placeholder="Pohlaví" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Male">Muž</SelectItem>
          <SelectItem value="Female">Žena</SelectItem>
          <SelectItem value="Other">Jiné</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        placeholder="Bio"
        className={field(errors.bio)}
      />

      {/* INTERESTS */}
      <div className="flex flex-wrap gap-2 mt-3">
        {INTEREST_OPTIONS.map((i) => (
          <button
            key={i}
            onClick={() => toggleInterest(i)}
            className={`text-xs px-3 py-1 rounded-xl ${
              form.interests.includes(i)
                ? "bg-yellow-500"
                : "bg-white/10"
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="mt-6 w-full">
        {saving ? <Loader2 className="animate-spin" /> : "Uložit"}
      </Button>

      <button onClick={() => signOut(auth)} className="flex items-center gap-2 mt-6">
        <LogOut /> Logout
      </button>

      <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 mt-3">
        <Trash2 /> Smazat účet
      </button>
    </div>
  );
}