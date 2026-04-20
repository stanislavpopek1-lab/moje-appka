import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";

const WOMAN_IMG = "https://media.base44.com/images/public/69d103e2ba2a13f268d7f059/dc7e1fc59_generated_image.png";
const MAN_IMG = "https://media.base44.com/images/public/69d103e2ba2a13f268d7f059/2737756c4_generated_image.png";

const INTENTS = [
  { label: "💞 Hledám partnera/partnerku", value: "partner" },
  { label: "💬 Nezávazné seznámení", value: "casual" },
  { label: "👫 Nová přátelství", value: "friends" },
];

export default function OnboardingModal() {
  const [step, setStep] = useState(1); // 1 = gender, 2 = intent, 3 = register
  const [selectedGender, setSelectedGender] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGender = (gender) => {
    setSelectedGender(gender);
    setStep(2);
  };

  const handleIntent = () => {
    setStep(3);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    base44.auth.redirectToLogin();
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <AnimatePresence mode="wait">
        {/* Step 1: Gender selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary fill-primary/40" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-1">Vítejte na Flame</h2>
            <p className="text-muted-foreground text-sm mb-8">Kdo jsi?</p>

            <div className="flex gap-5 justify-center mb-8">
              {/* Woman */}
              <button
                onClick={() => handleGender("Female")}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="relative w-32 h-36 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-200 shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transform">
                  <img src={WOMAN_IMG} alt="Woman" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-0 right-0 text-white text-sm font-semibold">Žena</span>
                </div>
              </button>

              {/* Man */}
              <button
                onClick={() => handleGender("Male")}
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="relative w-32 h-36 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-200 shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transform">
                  <img src={MAN_IMG} alt="Man" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-0 right-0 text-white text-sm font-semibold">Muž</span>
                </div>
              </button>
            </div>

            <button
              onClick={handleLogin}
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
            >
              Již máte účet? <span className="font-semibold">Přihlásit se</span>
            </button>
          </motion.div>
        )}

        {/* Step 2: Intent */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
          >
            <h2 className="text-2xl font-heading font-bold mb-1">Co hledáš?</h2>
            <p className="text-muted-foreground text-sm mb-7">Pomůžeme ti najít správné lidi</p>

            <div className="space-y-3 mb-8">
              {INTENTS.map((intent) => (
                <button
                  key={intent.value}
                  onClick={handleIntent}
                  className="w-full py-4 px-5 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 text-sm font-medium transition-all duration-200 text-left"
                >
                  {intent.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogin}
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
            >
              Již máte účet? <span className="font-semibold">Přihlásit se</span>
            </button>
          </motion.div>
        )}

        {/* Step 3: Sign up CTA */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-3xl shadow-2xl p-8 w-full max-w-md text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-primary fill-primary/40" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Téměř hotovo!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Vytvořte si bezplatný účet a začněte se setkávat s úžasnými lidmi na Flame. to start connecting with amazing people on Flame.
            </p>

            <Button
              onClick={handleRegister}
              className="w-full rounded-full h-12 text-base font-semibold mb-3"
            >
              Vytvořit bezplatný účet
            </Button>

            <button
              onClick={handleLogin}
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline font-medium transition-colors"
            >
              Již máte účet? <span className="font-semibold">Přihlásit se</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}