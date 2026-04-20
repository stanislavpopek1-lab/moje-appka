import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function AgeVerification({ onVerified }) {
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
      style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        className="relative max-w-sm w-full text-center"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-flame mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
          <span className="text-3xl font-heading font-bold" style={{color: "hsl(35 25% 8%)"}}>Z</span>
        </div>

        <h1 className="text-4xl font-heading font-bold mb-2 text-gradient">Zlatíčka</h1>
        <p className="text-muted-foreground text-sm mb-2 tracking-wide">Pouze pro dospělé · 18+</p>

        <div className="glass rounded-2xl p-6 mb-6 mt-6 text-left"
          style={{ border: "1px solid rgba(218,165,32,0.25)" }}>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Ověření věku</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tato platforma obsahuje obsah pro dospělé určený uživatelům starším 18 let.
                Vstupem potvrzujete, že splňujete tento věkový požadavek a souhlasíte s{" "}
                <Link to="/terms" className="text-primary hover:underline">Podmínkami použití</Link>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full h-12 rounded-2xl font-semibold mb-3 transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))",
            boxShadow: "0 8px 32px rgba(218,165,32,0.4)",
            color: "hsl(35 25% 8%)"
          }}
        >
          Je mi 18 nebo více — Vstoupit
        </button>
        <button
          onClick={handleDeny}
          className="w-full h-11 rounded-2xl text-sm text-muted-foreground glass hover:bg-white/5 transition-colors"
        >
          Je mi méně než 18 — Odejít
        </button>
      </motion.div>
    </motion.div>
  );
}