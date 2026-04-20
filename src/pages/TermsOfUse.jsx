import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

const terms = [
  {
    title: "1. Věkové omezení",
    text: "Přístup na tento web je povolen pouze osobám starším 18 let. Vstupem potvrzujete, že jste dosáhli věku 18 let. Pokud je vám méně než 18 let, ihned opusťte tento web.",
  },
  {
    title: "2. Obsah pro dospělé (NSFW)",
    text: "Na tomto webu je povolen obsah pro dospělé (NSFW – Not Safe For Work). Jakýkoli nelegální obsah je přísně zakázán, včetně obsahu zobrazujícího nezletilé osoby, obsahu porušujícího autorská práva nebo jinak nelegálního materiálu.",
  },
  {
    title: "3. Odpovědnost za obsah",
    text: "Uživatelé jsou plně odpovědni za veškerý obsah, který nahrají nebo sdílejí na platformě. Nahráváním obsahu potvrzujete, že máte právo tento obsah sdílet a že neporušuje práva třetích stran.",
  },
  {
    title: "4. Zakázané chování",
    text: "Na platformě jsou přísně zakázány: obtěžování, vyhrožování, šikana, podvody, vydávání se za jiné osoby, šíření spamu, nebo jakékoli jiné nezákonné aktivity. Porušení těchto pravidel může vést k okamžitému zrušení účtu.",
  },
  {
    title: "5. Moderace obsahu",
    text: "Provozovatel webu si vyhrazuje právo kdykoli odebrat jakýkoli obsah, který porušuje tyto podmínky, nebo pozastavit či trvale zablokovat účet uživatele bez předchozího upozornění.",
  },
  {
    title: "6. Smazání účtu",
    text: "Uživatelé mohou kdykoli smazat svůj účet a veškerá přidružená data prostřednictvím nastavení profilu. Po smazání účtu budou všechna osobní data trvale odstraněna z našich serverů.",
  },
  {
    title: "7. Soukromí",
    text: "Vaše osobní údaje jsou zpracovávány v souladu s platnými právními předpisy o ochraně osobních údajů. Vaše data nebudeme prodávat třetím stranám.",
  },
  {
    title: "8. Změny podmínek",
    text: "Provozovatel si vyhrazuje právo tyto podmínky kdykoli změnit. O podstatných změnách budou uživatelé informováni. Dalším používáním webu po změně podmínek vyjadřujete souhlas s novými podmínkami.",
  },
];

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-heading font-bold">Podmínky použití</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tyto podmínky použití upravují přístup a užívání platformy Zlatíčka. Přečtěte si je prosím pečlivě před použitím webu.
          Poslední aktualizace: duben 2026.
        </p>
      </div>

      <div className="space-y-4">
        {terms.map((term, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-base mb-2 text-foreground">{term.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{term.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center">
        <p className="text-xs text-muted-foreground">
          Používáním platformy Zlatíčka potvrzujete, že jste si přečetli, porozuměli a souhlasíte s těmito podmínkami použití.
        </p>
      </div>
    </div>
  );
}