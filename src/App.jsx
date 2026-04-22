import React, { useEffect, useState } from "react";
import { Toaster } from "./components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/query-client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { auth } from "./firebase";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "./lib/AuthContext";
import { ThemeProvider } from "./lib/ThemeContext";

import Layout from "./components/Layout";

import Discover from "./pages/Discover";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Feed from "./pages/Feed";

import OnboardingModal from "./components/OnboardingModal";
import AgeVerification from "./components/AgeVerification";
import TermsOfUse from "./pages/TermsOfUse";

/* =========================
   LOADER
========================= */
const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

/* =========================
   AUTH WRAPPER
========================= */
const AuthenticatedApp = () => {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [ageVerified, setAgeVerified] = useState(
    () => localStorage.getItem("flame-age-verified") === "true"
  );

  const normalizedPath = location.pathname.replace(/\/$/, "");
  const publicRoutes = ["/terms", "/termsofuse"];

  const isPublicRoute = publicRoutes.some((route) =>
    normalizedPath.startsWith(route)
  );

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  const handleAgeVerified = () => {
    localStorage.setItem("flame-age-verified", "true");
    setAgeVerified(true);
  };

  if (!authReady) {
    return <Loader />;
  }

  return (
    <>
      {/* AGE CHECK */}
      {!ageVerified && !isPublicRoute && (
        <AgeVerification onVerified={handleAgeVerified} />
      )}

      {/* ONBOARDING */}
      {!isPublicRoute && !user && <OnboardingModal />}

      <Routes>
        <Route element={<Layout />}>

          {/* HOME / FEED / DISCOVER */}
          <Route path="/" element={<Discover />} />
          <Route path="/feed" element={<Feed />} />

          {/* 🔥 PROFILE SYSTEM FIX */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* 👇 TOTO JE KLÍČOVÉ - klik na uživatele */}
          <Route path="/profile/:email" element={<Profile />} />

          {/* OTHER */}
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:matchId" element={<Chat />} />

          {/* PUBLIC */}
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />

          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </>
  );
};

/* =========================
   APP ROOT
========================= */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;