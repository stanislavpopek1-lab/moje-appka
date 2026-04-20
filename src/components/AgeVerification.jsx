import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldX } from "lucide-react";

export default function AgeVerification({ onVerified }) {
  const handleUnder18 = () => {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:24px;">
        <span style="font-size:64px;margin-bottom:24px">🔞</span>
        <h1 style="font-size:24px;font-weight:bold;margin-bottom:12px">Přístup odepřen</h1>
        <p style="color:#aaa;max-width:300px">Tento web je určen pouze pro osoby starší 18 let. Přístup ti byl odepřen.</p>
      </div>
    `;
  };

  const handleOver18 = () => {
    localStorage.setItem("flame-age-verified", "true");
    onVerified();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center border border-border"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔞</span>
        </div>
        <h2 className="text-2xl font-heading font-bold mb-2">Ověření věku</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Tento web obsahuje obsah určený pouze pro dospělé.
        </p>
        <p className="text-sm font-medium mb-8">
          Je ti <span className="text-primary font-bold">18 let nebo více</span>?
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleOver18}
            className="w-full rounded-full h-12 text-base font-semibold gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Ano, je mi 18+ let
          </Button>
          <Button
            onClick={handleUnder18}
            variant="outline"
            className="w-full rounded-full h-12 text-base font-semibold gap-2 text-muted-foreground"
          >
            <ShieldX className="w-5 h-5" />
            Ne, je mi méně než 18 let
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Vstupem potvrzujete, že jste plnoletí a souhlasíte s podmínkami používání.
        </p>
      </motion.div>
    </div>
  );
}