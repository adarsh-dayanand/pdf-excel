"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import type { User } from "firebase/auth";

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    setIsLoading(true);
    // This is a mock login. In a real app, you would use Firebase Auth.
    setTimeout(() => {
      setUser({
        displayName: "Demo User",
        email: "demo@excelconvert.com",
        photoURL: `https://placehold.co/100x100.png`,
      } as User);
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoggedIn: user !== null,
      user,
      login,
      logout,
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
