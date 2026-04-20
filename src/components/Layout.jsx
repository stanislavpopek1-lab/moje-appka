import { Outlet, Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Heart, Search, MessageCircle, User, Rss } from "lucide-react";

const navItems = [
  { path: "/", icon: Search, label: "Objevovat" },
  { path: "/feed", icon: Rss, label: "Příspěvky" },
  { path: "/matches", icon: Heart, label: "Shody" },
  { path: "/messages", icon: MessageCircle, label: "Zprávy" },
  { path: "/profile", icon: User, label: "Profil" },
];

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background font-body flex flex-col">
      <main className="flex-1 pb-20 md:pb-0 md:pl-20">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path || 
              (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-[10px] font-medium">{theme === "dark" ? "Světlý" : "Tmavý"}</span>
          </button>
        </div>
      </nav>

      {/* Desktop side nav */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card/80 backdrop-blur-xl border-r border-border flex-col items-center py-8 gap-2 z-50">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-8">
          <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
        </div>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 mt-auto"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-[10px] font-medium">{theme === "dark" ? "Světlý" : "Tmavý"}</span>
        </button>
      </nav>
    </div>
  );
}