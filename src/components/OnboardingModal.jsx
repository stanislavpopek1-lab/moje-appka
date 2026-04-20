import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Heart, Sparkles, Users, Star } from "lucide-react";

const steps = [
  {
    icon: Heart,
    title: "Najdi své zlatíčko",
    subtitle: "Objevuj lidi, kteří ti sedí do srdce",
  },
  {
    icon: Sparkles,
    title: "Propojte se okamžitě",
    subtitle: "Zhodnoťte shodu, chatujte a potkejte se",
  },
  {
    icon: Users,
    title: "Připoj se ke komunitě",
    subtitle: "Sdílej své momenty s podobně smýšlejícími lidmi",
  },
];

export default function OnboardingModal() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="w-full max-w-sm glass-strong rounded-3xl p-8 text-center"
        style={{ border: "1px solid rgba(220,60,90,0.2)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-flame mx-auto mb-8 flex items-center justify-center glow-sm">
          <span className="text-xl font-heading font-bold" style={{color: "hsl(35 25% 8%)"}}>Z</span>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: direction * 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 30, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-5 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 my-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "bg-primary w-5" : "bg-white/15 w-1.5"
              }`}
            />
          ))}
        </div>

        {step < steps.length - 1 ? (
          <div className="flex gap-3">
            <button onClick={handleLogin} className="flex-1 h-11 rounded-2xl glass text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              Přihlásit se
            </button>
            <button onClick={handleNext}
              className="flex-1 h-11 rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))", color: "hsl(35 25% 8%)" }}>
              Další
            </button>
          </div>
        ) : (
          <button onClick={handleLogin}
            className="w-full h-12 rounded-2xl font-semibold hover:opacity-90 transition-opacity"
            style={{
              background: "linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))",
              boxShadow: "0 8px 32px rgba(218,165,32,0.35)",
              color: "hsl(35 25% 8%)"
            }}>
            Začít — Připojit se ke Zlatíčka
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}