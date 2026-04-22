import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Layout from './components/Layout';

import Discover from './pages/Discover';
import EditProfile from './pages/EditProfile';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Feed from './pages/Feed';
import TermsOfUse from './pages/TermsOfUse';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Discover />} />
        <Route path="/feed" element={<Feed />} />
        
        {/* 🔥 PROFILE FIX */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />

        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:matchId" element={<Chat />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

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