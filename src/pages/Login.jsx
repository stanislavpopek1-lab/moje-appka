import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

export default function Login() {
  const login = async () => {
    await signInWithPopup(auth, googleProvider);
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button onClick={login} className="px-6 py-3 bg-black text-white rounded-xl">
        Přihlásit se přes Google
      </button>
    </div>
  );
}