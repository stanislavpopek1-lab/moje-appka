import { Outlet, Link, useLocation } from "react-router-dom";
import { Heart, Search, MessageCircle, User, Rss, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const navItems = [
  { path: "/", icon: Search, label: "Objevit" },
  { path: "/feed", icon: Rss, label: "Feed" },
  { path: "/matches", icon: Heart, label: "Shody" },
  { path: "/messages", icon: MessageCircle, label: "Zprávy" },
  { path: "/profile", icon: User, label: "Profil" },
];

export default function Layout() {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      <main className="flex-1 pb-24 md:pb-0 md:pl-[88px] relative z-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-strong mx-3 mb-4 rounded-2xl">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path ||
                (path !== "/" && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`relative ${isActive ? "animate-float" : ""}`}>
                    <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(218,165,32,0.9)]" : ""}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`text-[9px] font-medium tracking-wide uppercase ${isActive ? "text-primary" : ""}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop side nav */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-[88px] flex-col items-center py-8 gap-1 z-50 glass border-r border-white/5">
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-flame flex items-center justify-center mb-6 glow-sm animate-pulse-glow">
          <span className="text-lg font-heading font-bold text-white">Z</span>
        </div>

        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              title={label}
              className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 w-16 ${
                isActive
                  ? "bg-primary/15 text-primary glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(218,165,32,0.9)]" : ""}`} />
              <span className="text-[8px] font-medium tracking-widest uppercase">{label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-flame rounded-r-full" />
              )}
            </Link>
          );
        })}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "dark" ? "Světlý režim" : "Tmavý režim"}
          className="mt-auto w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>
    </div>
  );
}