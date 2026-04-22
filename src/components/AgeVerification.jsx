import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AgeVerification({ onVerified }) {
  const location = useLocation();

  const isPublicRoute =
    location.pathname.startsWith("/terms") ||
    location.pathname.startsWith("/termsofuse");

  if (isPublicRoute) return null;

  const handleConfirm = () => {
    localStorage.setItem("flame-age-verified", "true");
    onVerified();
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)"
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-200/30 blur-[120px]" />
      </div>

      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        className="relative max-w-sm w-full text-center"
      >
        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
          style={{
            background: "linear-gradient(135deg, #ffe08a, #ffb84d)"
          }}
        >
          <span
            className="text-3xl font-heading font-bold"
            style={{ color: "#2a1a00" }}
          >
            Z
          </span>
        </div>

        <h1 className="text-4xl font-heading font-bold mb-2 text-gray-900">
          Zlatíčka
        </h1>

        <p className="text-gray-500 text-sm mb-2 tracking-wide">
          Pouze pro dospělé · 18+
        </p>

        <div
          className="rounded-2xl p-6 mb-6 mt-6 text-left"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1 text-gray-900">
                Ověření věku
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tato platforma obsahuje obsah pro dospělé určený uživatelům
                starším 18 let. Vstupem souhlasíte s{" "}
                <Link to="/termsofuse" className="text-yellow-600 hover:underline">
                  Podmínkami použití
                </Link>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full h-12 rounded-2xl font-semibold mb-3 transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #ffe08a, #ffb84d)",
            boxShadow: "0 8px 32px rgba(255, 184, 77, 0.35)",
            color: "#2a1a00"
          }}
        >
          Je mi 18 nebo více — Vstoupit
        </button>

        <button
          onClick={handleDeny}
          className="w-full h-11 rounded-2xl text-sm text-gray-500 hover:bg-black/5 transition-colors"
        >
          Je mi méně než 18 — Odejít
        </button>
      </motion.div>
    </motion.div>
  );
}