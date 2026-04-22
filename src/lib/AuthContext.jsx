import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);

  useEffect(() => {
    // 🔥 FAKE USER (dokud nemáš Firebase)
    const fakeUser = {
      id: "1",
      name: "Test User"
    };

    setUser(fakeUser);
    setIsLoadingAuth(false);
  }, []);

  const navigateToLogin = () => {
    console.log("redirect to login (fake)");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        authError,
        isLoadingPublicSettings,
        navigateToLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);